export const profile = {
  name: "Satyam",
  headline: "Hands-on senior engineer · Fintech, rewards & AI · End-to-end systems",
  intro: [
    "I take ambiguous product ideas to production systems used by real customers, and I stay close to the code the whole way. I build complete systems where correctness matters: money movement, rewards ledgers, bookings and partner integrations, where retries, duplicate webhooks and half-finished partner calls are normal and have to be designed for.",
    "As a founding engineer at ANQ, I built the Rewards & Custody system of a multi-tenant fintech platform, from the rules engine that decides what customers earn to gold and crypto custody backed by real assets at partners. I've also built a microservice flight-booking platform, and AlphaTribe, an AI pipeline that turns stock-exchange filings into a social feed.",
    "AI coding tools are part of my daily workflow: exploring requirements, drafting implementation plans, writing tests, debugging and reviewing code. I use them to move faster, and I still check every change with tests and my own judgment.",
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
    title: "From ambiguous idea to shipped outcome",
    body: "As a founding engineer, there was rarely a finished spec. Requirements like \"reward card spends in gold or Bitcoin\" became schemes, rules, lock-in, custody and partner integrations that real customers used. I'm comfortable owning a feature from the first conversation to production and the metrics after it.",
  },
  {
    title: "Fintech and rewards: the bonus",
    body: "I've built rewards that are earned, locked, unlocked, expired and backed by real assets, with issuance pools, ledgers, idempotent allocation and reconciliation against partners. A miles currency that never expires needs the same exact, auditable balances. My flight-booking work covers the other end: getting a redemption to a confirmed seat.",
  },
  {
    title: "Technical depth across systems, data and AI",
    body: "Concurrency-safe seat holds, sagas with explicit undo steps, the outbox pattern, payment idempotency enforced by the database. On the AI side, AlphaTribe runs PDF extraction and LLM summarisation of ~5,000 filings a day, with model fallback and per-call cost tracking.",
  },
  {
    title: "AI-augmented, with judgment",
    body: "I use AI coding tools every day for planning, implementation, tests, debugging and review. The speed is real, but the output still has to pass tests, match the design and make sense to the next engineer. I'm happy to share the patterns that work for me with the team.",
  },
  {
    title: "Fast, but not careless",
    body: "I ship simple first and make it safe: idempotency keys, reconciliation jobs, dead-letter queues, structured logs and alerts for stuck states. Every system here has its trade-offs written down, like PostgreSQL over Redis locks for seats, RabbitMQ over Kafka, and a synchronous path for Mint.",
  },
  {
    title: "Ownership and clear communication",
    body: "I care about outcomes, not tickets: noticing reliability gaps before customers do, writing designs others can review, and explaining trade-offs to product, business and operations in plain language. This site is one example of how I like to communicate technical work.",
  },
];

export const confession = {
  title: "Yes, I built a website for one interview",
  lines: [
    "I know. A few slides would have done the job, and a whole website for one conversation is a little extra. Possibly cringe. I made peace with that somewhere around the third Mermaid diagram.",
    "But I hear you throw warm bodies at problems, so I wanted to show up as a reasonably warm, slightly over-prepared one. This is what commitment looks like when it's written in TypeScript.",
  ],
  facts: [
    "No bird strikes or CrowdStrikes happened during the making of this site.",
    "Built with an AI coding agent as my pair programmer, which felt right for a role that asks for exactly that.",
    "Every diagram zooms, in case you want to go down the rabbit hole.",
    "Max Miles issued by this website: zero. Unless you sneeze ↓",
  ],
};
