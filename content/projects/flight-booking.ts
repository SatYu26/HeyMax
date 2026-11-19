import type { Project } from "../types";

export const flightBooking: Project = {
  slug: "flight-booking",
  name: "Flight Booking System",
  subtitle: "Distributed booking with concurrent inventory and reliable payments",
  context:
    "Designing a distributed flight-booking platform with concurrent inventory management, transactional workflows and reliable payment processing.",
  domain: "Travel · Microservices · Consistency",
  highlights: [
    "No double booking",
    "Booking saga + state machine",
    "Payment idempotency",
    "Outbox pattern",
  ],
  stack: [
    "Node.js + TypeScript microservices",
    "PostgreSQL (database per service)",
    "Redis",
    "RabbitMQ",
    "Nginx",
    "Razorpay · Cashfree",
  ],
  overview: [
    "A MakeMyTrip-style platform for domestic flights in India. Users search direct and one-stop routes, select several seats at once, apply a discount, pay, and receive a PNR, e-ticket and invoice. Flight data comes from airline partner APIs.",
    "It's a simplified booking platform rather than a full airline reservation or revenue-management system. The interesting parts are seat inventory under concurrency, a booking flow that spans several services and an external payment gateway, and making every step safe to retry.",
  ],
  chapters: [
    {
      id: "architecture",
      title: "Architecture",
      intro:
        "Search is read-heavy and served from pre-computed routes in Redis. Seats, bookings and payments need strong consistency and live in PostgreSQL, one database per service. The Booking Service coordinates the flow; services talk through a message queue for anything asynchronous.",
      diagram: {
        doc: "Travel Booking.md",
        index: 0,
        title: "Flight booking: high-level architecture",
        height: 640,
      },
      table: {
        headers: [ "", "Capacity estimate" ],
        rows: [
          [ "Flights", "~3,500/day → ~315K for a 90-day window" ],
          [ "Seat rows", "~180 per flight → ~57M rows" ],
          [ "Bookings", "~100K/day, ~20/sec peak" ],
          [ "Searches", "~1,200/sec peak, ~5K/sec on sale days" ],
          [ "Search cache", "~10K airport pairs × 90 days × 5 KB ≈ 4.5 GB" ],
        ],
      },
    },
    {
      id: "search",
      title: "One-stop route search",
      intro:
        "Computing one-stop connections on every request is too slow at peak. A Route Builder pre-computes all direct and one-stop options per (source, destination, date) whenever flight data changes, and stores them in Redis.",
      points: [
        {
          title: "Valid connections",
          body: "A connection is valid only with a layover between 45 minutes and 12 hours, at most two hops.",
        },
        {
          title: "Eventual vs strong consistency",
          body: "Search may be seconds old (10-minute TTL, cleared early on cancel / depart / sold out). Live seat availability is always re-checked at hold time.",
        },
        {
          title: "Airline sync off the request path",
          body: "Partner APIs are polled on a timer with exponential backoff. If an airline is slow or down, users still see the last good data.",
        },
      ],
    },
    {
      id: "seats",
      title: "Seat holds without double booking",
      intro:
        "A user may pick 12A and 12B together and must get both or neither. The database is the single source of truth: all requested seats are held with one conditional update inside one transaction.",
      code: {
        language: "sql",
        caption:
          "If the updated row count ≠ seats requested, roll back and show \"seat just taken\". Only one transaction can change a row at a time, so two users can never both win.",
        code: `UPDATE seats
SET status = 'HELD', hold_id = :holdId, held_by_user = :userId,
    hold_expires_at = now() + interval '10 minutes'
WHERE flight_id = :flightId
  AND seat_number = ANY(:seats)
  AND (status = 'AVAILABLE'
       OR (status = 'HELD' AND hold_expires_at < now()));`,
      },
      points: [
        {
          title: "Expired holds are free immediately",
          body: "The query treats an expired HELD seat as available, so releasing seats never depends on a background job running on time.",
        },
        {
          title: "Extend once at payment",
          body: "When the user starts paying, the hold is extended by 5 minutes so a slow payment page does not lose the seats.",
        },
        {
          title: "Why PostgreSQL, not Redis locks",
          body: "~20 bookings/sec is easy for the database, and one source of truth avoids a Redis lock disagreeing with the database after a crash.",
        },
      ],
    },
    {
      id: "booking-flow",
      title: "Flow: book and pay",
      intro:
        "The price is always calculated on the server from the hold, fare and coupon; the app never sends a price. Payment results come from the gateway webhook, never from the app.",
      diagram: {
        doc: "Travel Booking.md",
        index: 1,
        title: "Booking and payment sequence",
        height: 620,
      },
      steps: [
        "Seat Service holds all chosen seats for 10 minutes and returns a holdId.",
        "Booking Service checks the hold belongs to the user, reserves the coupon with the Discount Service, computes the total and saves the booking as AWAITING_PAYMENT.",
        "Payment Service creates a gateway order (same Idempotency-Key → same order); booking moves to PAYMENT_IN_PROGRESS.",
        "Webhook: signature verified, repeats ignored, payment saved with a \"payment successful\" event.",
        "Booking Service turns held seats into BOOKED only if the hold is still theirs, marks the booking CONFIRMED and the coupon USED.",
        "Ticket Service creates PNR, e-ticket and invoice; Notification Service sends them.",
      ],
    },
    {
      id: "state-machine",
      title: "Booking state machine",
      intro:
        "A booking can only move along these arrows. Every move is a conditional update, so duplicate and out-of-order messages are harmless: a late \"payment failed\" cannot undo a CONFIRMED booking.",
      diagram: {
        doc: "Travel Booking.md",
        index: 2,
        title: "Booking states and allowed transitions",
        height: 480,
      },
      code: {
        language: "sql",
        caption:
          "0 rows changed means the move was already made or isn't allowed; the message is safely ignored. Every move is written to booking_status_history.",
        code: `UPDATE bookings SET status = 'CONFIRMED'
WHERE id = :id AND status = 'PAYMENT_IN_PROGRESS';`,
      },
    },
    {
      id: "saga",
      title: "Saga: every failure has an undo step",
      intro:
        "Seat → Booking → Payment → Ticket live in different services, and the payment gateway is outside our control. One big transaction is impossible, so the Booking Service coordinates a saga where each step has a compensation, and every compensation checks state first so running it twice changes nothing.",
      table: {
        headers: [ "What went wrong", "What the system does" ],
        rows: [
          [ "Some chosen seats already taken", "Nothing is held (all or none); user picks again" ],
          [ "Payment failed", "Back to AWAITING_PAYMENT; retry allowed until the hold ends" ],
          [ "User never pays", "Cleanup job: booking EXPIRED, seats AVAILABLE, coupon released" ],
          [ "Webhook late or missing", "Reconciliation job asks the gateway about payments in progress > 5 min" ],
          [ "Paid, but hold expired and seat taken", "Booking CANCELLED, automatic refund, user notified" ],
          [ "Ticket / PDF creation fails", "Retried; booking stays CONFIRMED; DLQ + alert after 5 tries" ],
          [ "Refund call fails", "Retried with backoff; manual review queue after 5 tries" ],
        ],
      },
    },
    {
      id: "payments",
      title: "Payment idempotency enforced by the database",
      intro:
        "Users double-tap Pay; gateways send webhooks twice, late or out of order. Duplicates are blocked by unique constraints, not just application code.",
      code: {
        language: "sql",
        code: `payments  ( idempotency_key UNIQUE,
            gateway_order_id UNIQUE, gateway_payment_id UNIQUE, ... )
-- only one active payment per booking
UNIQUE (booking_id) WHERE status IN ('CREATED', 'SUCCESS')

payment_webhook_events ( gateway_event_id PRIMARY KEY, ... )
refunds   ( payment_id UNIQUE, ... )   -- one refund per payment`,
      },
    },
    {
      id: "outbox",
      title: "Reliable messages: outbox + idempotent consumers",
      steps: [
        "Save together: the data change and its message are written to the service's outbox table in the same transaction.",
        "Send: an Outbox Relay publishes unsent rows to the queue and marks them sent, retrying until it succeeds.",
        "Receive once: consumers record the event ID in processed_events in the same transaction as their work; repeats hit the unique key and are skipped.",
        "Retry, then park: after 5 failures a message moves to a dead-letter queue with an alert, and can be replayed after the fix.",
        "Every message carries eventId, bookingId and traceId so one booking can be followed end to end.",
      ],
    },
    {
      id: "testing",
      title: "How it's tested",
      intro:
        "Integration tests run the real services, PostgreSQL, Redis and the queue together, with a fake gateway that can succeed, fail, delay or repeat webhooks. Tests assert the final database state, not just API responses.",
      table: {
        headers: [ "Scenario", "Expected result" ],
        rows: [
          [ "50 users hold the same seat at once", "Exactly 1 succeeds" ],
          [ "12A+12B vs 12B+12C at the same time", "One user gets both seats, the other none" ],
          [ "Same success webhook sent 3 times", "One payment, one ticket, one email" ],
          [ "\"Failed\" webhook arrives after \"success\"", "Booking stays CONFIRMED" ],
          [ "Service crashes after saving, before sending", "Outbox Relay still delivers" ],
          [ "Coupon with 1 use left, two users at once", "Only one booking gets the discount" ],
        ],
      },
    },
  ],
  tradeoffs: [
    {
      choice: "Seat holds in PostgreSQL",
      why: "One source of truth; exact expiry; ~20 bookings/sec is easy",
      alternative: "Redis locks: faster, but can disagree with the DB after a crash",
    },
    {
      choice: "Booking Service as saga coordinator",
      why: "Clear undo steps; one place to see a booking's state",
      alternative: "Choreography: fewer central parts, harder to reason about failures",
    },
    {
      choice: "At-least-once delivery + skip repeats",
      why: "Simple and reliable with any queue",
      alternative: "Exactly-once: complex and tied to specific queue products",
    },
    {
      choice: "Pre-computed one-stop routes",
      why: "Search latency independent of traffic",
      alternative: "Compute per request: simpler, slower at scale",
    },
    {
      choice: "RabbitMQ",
      why: "Reliable and enough for ~100K bookings/day",
      alternative: "Kafka: replay and throughput, more cost than needed now",
    },
    {
      choice: "Cache-first search",
      why: "Read-heavy traffic and sale-day spikes",
      alternative: "Slightly stale results, accepted because seats are re-checked at hold",
    },
  ],
  conversation: [
    "Seat holds: conditional update in PostgreSQL vs Redis locks vs inventory counters per fare class",
    "What changes if inventory is owned by the airline and we only hold it through their API",
    "Recovering when the payment succeeds but the hold has already expired",
    "Where I'd draw service boundaries differently if starting again",
  ],
};
