import type { Project } from "../types";

export const anq: Project = {
  slug: "anq-finance",
  name: "ANQ Finance",
  subtitle: "Rewards & Custody on a multi-tenant fintech platform",
  context:
    "Building financial and rewards infrastructure for a multi-tenant fintech platform.",
  domain: "Fintech · Rewards · Custody",
  highlights: [
    "Configurable rewards engine",
    "Gold & crypto custody",
    "Idempotent money movement",
    "Partner reconciliation",
  ],
  stack: [
    "Deno + TypeScript (Oak)",
    "PostgreSQL",
    "Redis",
    "MongoDB (logs)",
    "Deno.cron",
    "Docker",
    "Koshex · Mudrex · CoinGecko",
  ],
  overview: [
    "Rewards & Custody is the part of the ANQ fintech platform that turns customer activity into real assets. Customers earn rewards (\"bounties\") when they pay a joining fee, refer a friend, buy a gift card, spend on their prepaid card or tap the daily Mint button. The value is decided in rupees and converted into Digital Gold or Bitcoin at that moment's price.",
    "Rewards decides how much a customer earns and manages lock-in, unlock and expiry. Custody is the wallet that holds the real gold and crypto at Koshex and Mudrex. From it, customers sell gold to their bank account, withdraw crypto to an outside wallet or deposit crypto.",
  ],
  chapters: [
    {
      id: "rewards-architecture",
      title: "Architecture",
      intro:
        "Source services (payments, card spends, gift cards) write a reward event to an outbox in the same database transaction as their own record. An Outbox Relay publishes events to the Reward Event Queue, so partner webhooks never wait for Rewards. The Allocation Worker checks idempotency, picks the scheme and rule, converts rupees to gold or BTC at that moment's price, and saves everything in one transaction. Daily Mint is the one synchronous path, because the customer is waiting on screen. Unlocked rewards move into Custody, which holds the real assets at partners.",
      diagram: {
        doc: "REWARDS_CUSTODY_SYSTEM_DESIGN.md",
        index: 0,
        title: "Rewards & Custody: high-level architecture",
        height: 680,
      },
    },
    {
      id: "rules",
      title: "How a reward amount is decided",
      intro:
        "Each organisation configures schemes (lock-in, expiry, validity, partner) and rules (amount). Exactly one scheme and one rule apply per reward; rules never stack.",
      table: {
        headers: [ "Rule type", "Example", "Used for" ],
        rows: [
          [ "FIXED", "₹200 on joining; Mint gives random ₹1–₹7", "Joining, referral, Mint" ],
          [ "PERCENTAGE", "5% on a specific gift card SKU", "Gift cards" ],
          [ "BUCKET-MULTIPLIER", "₹1.50 for every ₹150 spent", "Prepaid card spends" ],
        ],
      },
      points: [
        {
          title: "Precedence",
          body: "Scheme: partner scheme → default scheme. Rule: item rule (SKU / MCC) → beneficiary rule → default rule. Most specific wins.",
        },
        {
          title: "Time-correct",
          body: "The scheme is chosen by the event's OccurredAt, not processing time, so a late or replayed event uses the revision valid when it happened.",
        },
        {
          title: "Snapshots, not references",
          body: "Each allocation stores SchemeId, RuleId, base amount, coin amount, price and dates. Editing a scheme creates a new revision; existing rewards never change.",
        },
      ],
    },
    {
      id: "earn",
      title: "Flow: a customer earns a reward",
      intro:
        "Example: a ₹1,500 prepaid card spend, customer has chosen Digital Gold. Rule BUCKET-MULTIPLIER ₹1.50 per ₹150 gives ₹15. At ₹7,500/g that's 0.002 g, locked for 30 days and expiring after 90.",
      diagram: {
        doc: "REWARDS_CUSTODY_SYSTEM_DESIGN.md",
        index: 1,
        title: "Reward allocation through the outbox",
        height: 620,
      },
      steps: [
        "Card webhook arrives. The card transaction and an outbox reward event are committed in one transaction, and Pine gets its reply straight away.",
        "The Outbox Relay publishes unpublished rows (FOR UPDATE SKIP LOCKED, so two relays never publish the same row) to the Reward Event Queue.",
        "Idempotency: (Type, ReferenceId) is unique, so a duplicate webhook or a re-delivered event cannot create a second reward.",
        "Rule evaluation and price conversion; the price and price ID are stored with the reward so the coin amount never changes later.",
        "One PostgreSQL transaction: allocation (LOCKED) + reward account balances + issuance-pool reservation.",
        "Notify only after commit. Failures retry with backoff and park in a dead-letter queue after N attempts.",
      ],
    },
    {
      id: "lifecycle",
      title: "Reward life cycle",
      intro:
        "Rewards are locked so refunds and reversals can claw them back, then unlocked by a nightly job, and expire if not moved to custody. Nightly jobs run in batches of 1,000, each in its own transaction, and only pick rows still in the old status, so they are safe to re-run.",
      diagram: {
        doc: "REWARDS_CUSTODY_SYSTEM_DESIGN.md",
        index: 2,
        title: "Reward allocation state machine",
        height: 460,
      },
      table: {
        headers: [ "Status", "Reward account effect", "Pool effect" ],
        rows: [
          [ "LOCKED", "+ Locked, + Balance, + Lifetime", "Reserve from ISSUANCE_POOL" ],
          [ "UNLOCKED", "Locked → Available", "—" ],
          [ "TRANSFERRED", "− Available; + custody CHECKIN", "ISSUANCE_POOL → TREASURY" ],
          [ "EXPIRED / REVERSED", "− Locked or Available", "Release to ISSUANCE_POOL" ],
        ],
      },
    },
    {
      id: "backing",
      title: "Every reward is backed",
      intro:
        "A reward of 0.002 g gold is a promise; real gold has to exist at Koshex. The company keeps pool accounts per currency. Allocating a reward reserves from the ISSUANCE_POOL, moving it to custody transfers the backing to TREASURY, and expiry returns it. Ops refills pools from the CRM, and a low pool raises an alert.",
      diagram: {
        doc: "REWARDS_CUSTODY_SYSTEM_DESIGN.md",
        index: 4,
        title: "Who owns which account",
        height: 440,
      },
      points: [
        {
          title: "Append-only ledger",
          body: "Every balance change writes ledger entries in the same transaction as the balance update. The entries of one operation sum to zero per currency. No entry, no balance change.",
        },
        {
          title: "Rebuild and reconcile",
          body: "A nightly job sums the ledger per account and compares it with the balance columns. Ledger totals are also compared with Koshex / Mudrex balances.",
        },
      ],
      code: {
        language: "text",
        caption: "Invariants checked nightly. A violation freezes money movement on that account.",
        code: `Reward account   Balance        = Available + Locked
                 Locked         = Σ allocations in LOCKED
                 Available      = Σ allocations in UNLOCKED
Custody account  CurrentBalance = Available + Locked + Withheld
Company          ISSUANCE_POOL reserved = Σ customer reward Balance
                 TREASURY ≥ Σ customer CHECKIN CurrentBalance
                 Our pools ≈ partner-reported balance (within alert %)`,
      },
    },
    {
      id: "withdraw",
      title: "Flow: withdraw crypto / sell gold",
      intro:
        "Both need two partner calls (internal transfer, then on-chain send or sale) and partners don't offer distributed transactions. So funds are held first, then the partner is called, then the hold is settled or reversed.",
      diagram: {
        doc: "REWARDS_CUSTODY_SYSTEM_DESIGN.md",
        index: 3,
        title: "Crypto withdrawal: hold → partner call → settle or reverse",
        height: 520,
      },
      points: [
        {
          title: "Hold first",
          body: "Customer CHECKIN moves Available → Locked; TREASURY is earmarked. Current balance is unchanged until the partner confirms.",
        },
        {
          title: "Automatic reversal",
          body: "If a Koshex sale fails after the transfer, SELL_REVERSE moves the gold back and restores balances. If the reverse also fails, the transaction is marked SELL_GOLD_AND_REVERSE_FAILED and ops is alerted.",
        },
        {
          title: "Client idempotency",
          body: "The app sends a SourceRequestId, which becomes the transaction ID. A retried request fails instead of creating a second withdrawal.",
        },
        {
          title: "Safety controls",
          body: "SMS + email OTP, wallet validation and whitelist, compliance screening, one withdrawal per 24 hours, KYC-based limits, penny-drop verified bank accounts.",
        },
      ],
    },
    {
      id: "deposits",
      title: "Compliance-gated deposits",
      points: [
        {
          title: "Pending until screened",
          body: "Incoming crypto is saved with compliance PENDING. Only SUCCESS from Mudrex's screening credits the customer and TREASURY.",
        },
        {
          title: "Failures are quarantined",
          body: "On FAILURE the funds go to WITHHELD and the source wallet is blocked. Unsupported coins are stored in InvalidTransactions for audit.",
        },
        {
          title: "Webhooks plus polling",
          body: "A compliance job polls Mudrex for anything still pending, so a missed webhook never leaves money stuck. Repeated webhooks with an unchanged status do nothing.",
        },
      ],
    },
  ],
  tradeoffs: [
    {
      choice: "Value in ₹, paid in gold / BTC",
      why: "Business budgets in a familiar unit; customer sees a familiar amount",
      alternative: "Fixed coin amounts: simpler, but cost swings with the market",
    },
    {
      choice: "Price locked at earning time",
      why: "Coin amount never changes; easy to audit",
      alternative: "Convert at unlock: customer carries price risk during lock-in",
    },
    {
      choice: "Lock-in before use",
      why: "Refunds can claw rewards back; reduces abuse",
      alternative: "Instant rewards: better experience, higher fraud risk",
    },
    {
      choice: "Pooled company accounts at partners",
      why: "Cheaper and faster than a partner wallet per customer",
      alternative: "Per-customer partner wallets: clearer, more partner fees",
    },
    {
      choice: "Hold → partner call → confirm / reverse",
      why: "Customer never loses funds if a partner step fails",
      alternative: "Distributed transaction: not offered by partners",
    },
    {
      choice: "Outbox + Reward Event Queue",
      why: "Events cannot be lost; webhooks reply fast; workers scale on their own",
      alternative: "Direct call inside the webhook: simpler, but partners wait and a crash loses the reward",
    },
    {
      choice: "Mint stays synchronous",
      why: "Customer is waiting on screen for the amount",
      alternative: "Queue + app polling: consistent, but a worse experience",
    },
    {
      choice: "Balance columns + ledger",
      why: "Balance columns give fast reads; ledger gives full history",
      alternative: "Ledger only (sum on read): perfect audit, slower screens",
    },
    {
      choice: "Polling + webhooks for compliance",
      why: "Webhooks can be missed; polling recovers",
      alternative: "Webhooks only: fewer calls, risk of stuck deposits",
    },
  ],
  conversation: [
    "How the issuance pool and treasury keep rewards backed, and where reconciliation catches drift",
    "Handling a partner that fails after the first of two calls",
    "How the outbox keeps reward events from being lost, and what it changes operationally",
    "Rule precedence and scheme revisions when business changes earn rates mid-month",
  ],
};
