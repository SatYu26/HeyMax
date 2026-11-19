export const profile = {
  name: "Satyam",
  headline: "Backend-focused product engineer",
  intro: [
    "I build backend systems where correctness matters: money movement, rewards, bookings and partner integrations. Most of my work has been on platforms that sit between customers and many outside vendors, where retries, duplicate webhooks and half-finished partner calls are normal and have to be designed for.",
    "As a founding engineer at ANQ, I worked on the Rewards & Custody system of a multi-tenant fintech platform: a configurable rewards engine, and gold and crypto custody backed by real assets at partners. I've also built a microservice flight-booking platform and an AI pipeline that turns stock-exchange filings into a social feed.",
  ],
  // Leave a field empty to hide it on the site.
  links: {
    email: "",
    linkedin: "",
    github: "",
    resume: "",
  },
};

export const fit = [
  {
    title: "Rewards are a balance sheet",
    body: "At ANQ, rewards were earned in rupees, converted to gold or Bitcoin, locked, unlocked and expired, and had to stay backed by assets held at partners. I worked with issuance pools, ledgers, idempotent allocation and nightly reconciliation. A miles currency that never expires has the same need for exact, auditable balances.",
  },
  {
    title: "Partners are part of the product",
    body: "Payment gateways, a card issuer, gold and crypto custodians and gift card vendors: each sends duplicate or late webhooks and fails halfway sometimes. I've built the patterns that keep this safe: re-verifying status with the partner, hold → call → confirm or reverse, and vendor routing by configuration.",
  },
  {
    title: "Travel booking is a consistency problem",
    body: "My flight-booking design covers one-stop route search, all-or-nothing seat holds, a booking state machine, a saga with explicit undo steps, and payment idempotency enforced by the database. These are the problems behind every redemption flow that ends in a confirmed seat.",
  },
  {
    title: "Pragmatic trade-offs",
    body: "Each system has its trade-offs written down: why PostgreSQL over Redis locks for seats, why RabbitMQ over Kafka, why a synchronous path for Mint. I'd rather ship a simpler system that's correct and observable, then evolve it, than over-build up front.",
  },
];
