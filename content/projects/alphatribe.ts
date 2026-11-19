import type { Project } from "../types";

export const alphaTribe: Project = {
  slug: "alphatribe",
  name: "AlphaTribe",
  subtitle: "AI-powered stock intelligence from exchange filings",
  context:
    "Building an AI-powered stock intelligence platform with automated market-data ingestion and document processing.",
  domain: "AI · Data pipelines · Consumer app",
  highlights: [
    "Filing ingestion pipeline",
    "PDF processing",
    "LLM summarisation with fallback",
    "Alert fan-out",
  ],
  stack: [
    "Node.js",
    "MongoDB",
    "Redis + BullMQ",
    "Gemini · OpenAI",
    "Next.js (web + admin)",
    "Cashfree · RevenueCat",
  ],
  overview: [
    "AlphaTribe reads company announcements from the NSE and BSE stock exchanges, uses AI to turn each filing into a short categorised post, and shows them to investors in a social feed. Paid users also get AI market reports, an AI chatbot (AlphaBot) and WhatsApp alerts.",
    "The engineering focus is a pipeline that has to be fresh (filing to feed in under 5 minutes), cheap (every AI call is tracked) and tolerant of slow or failing AI providers, while the feed itself stays fast at market open.",
  ],
  chapters: [
    {
      id: "architecture",
      title: "Architecture",
      intro:
        "The user-facing services and the announcement pipeline are separated, so slow PDF reads and AI calls never slow down the feed. Queues sit between every slow step.",
      diagram: {
        doc: "Stock Intelligence Platform.md",
        index: 0,
        title: "AlphaTribe: high-level architecture",
        height: 600,
      },
    },
    {
      id: "pipeline",
      title: "Flow: a filing becomes a post",
      diagram: {
        doc: "Stock Intelligence Platform.md",
        index: 1,
        title: "Announcement pipeline",
        height: 520,
      },
      steps: [
        "The Scheduler wakes the Fetcher per source: NSE every 5 min, BSE every 7, insider trades every 31, pledges every 183.",
        "The Fetcher skips filings already seen and puts each new one on the Work Queue.",
        "The PDF Reader extracts text; empty or scanned PDFs are skipped to save AI cost.",
        "The AI Summarizer writes a short summary and picks a category (results, dividend, insider trading, pledge …).",
        "The post is saved with a unique fingerprint and an \"alert followers\" job goes onto the Notification Queue.",
      ],
    },
    {
      id: "challenges",
      title: "Key challenges",
      points: [
        {
          title: "Duplicate announcements",
          body: "The same filing can appear on NSE and BSE, or a timer job can run twice. Every post has a unique fingerprint (exchange + filing ID or PDF link); Redis holds recent fingerprints for a fast check and the database unique index is the final guard.",
        },
        {
          title: "AI cost and failures",
          body: "Retries with exponential backoff, fallback from Gemini to OpenAI, skipping documents with no useful text, and logging the cost of every call.",
        },
        {
          title: "Alert storms",
          body: "A popular company can have 50K followers. Push goes out in batches of 500 devices per FCM call; WhatsApp and email workers use token buckets to stay within provider rate limits.",
        },
        {
          title: "Market-open spike",
          body: "The feed is served from Redis (60 s TTL in market hours, 5 min after), cleared on likes and comments, with more servers added behind the load balancer.",
        },
        {
          title: "Payment webhooks",
          body: "Cashfree and RevenueCat webhooks are signature-verified and processed once per orderId.",
        },
        {
          title: "Observability",
          body: "Dashboards for queue length, time from exchange to feed, AI cost per day, alert delivery rate and feed latency. An alert fires if no new posts arrive for 30 minutes during market hours.",
        },
      ],
    },
  ],
  tradeoffs: [
    {
      choice: "MongoDB",
      why: "Posts and agent reports vary in shape",
      alternative: "PostgreSQL: stronger for payment records if billing grows",
    },
    {
      choice: "Redis queue (BullMQ)",
      why: "Redis already exists; ~5K announcements/day is small",
      alternative: "Kafka: replay and throughput, more than this scale needs",
    },
    {
      choice: "Separate pipeline and feed services",
      why: "Slow AI work cannot slow the feed",
      alternative: "Single app: simpler, but AI jobs would compete with users",
    },
    {
      choice: "Polling exchanges on a timer",
      why: "NSE / BSE publish feeds, not push events",
      alternative: "—",
    },
  ],
  conversation: [
    "Keeping AI cost predictable while summarising ~5,000 filings a day",
    "Fallback between model providers and judging summary quality",
    "Fan-out of alerts to tens of thousands of followers within provider limits",
  ],
};
