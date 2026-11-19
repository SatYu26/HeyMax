export type DesignDoc =
  | "REWARDS_CUSTODY_SYSTEM_DESIGN.md"
  | "Travel Booking.md"
  | "Stock Intelligence Platform.md";

export type DiagramRef = {
  doc: DesignDoc;
  /** Zero-based position of the ```mermaid block inside the document. */
  index: number;
  title: string;
  caption?: string;
  /** Height of the inline viewer in pixels. */
  height?: number;
};

export type Chapter = {
  id: string;
  title: string;
  intro?: string;
  diagram?: DiagramRef;
  steps?: string[];
  points?: { title: string; body: string }[];
  code?: { language: string; code: string; caption?: string };
  table?: { headers: string[]; rows: string[][] };
};

export type Project = {
  slug: string;
  name: string;
  subtitle: string;
  /** One-line context shown on the landing page card. */
  context: string;
  domain: string;
  highlights: string[];
  stack: string[];
  overview: string[];
  chapters: Chapter[];
  tradeoffs: { choice: string; why: string; alternative: string }[];
  conversation: string[];
};
