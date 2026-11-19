import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DesignDoc, DiagramRef } from "@/content/types";

function docPath(doc: DesignDoc): string {
  switch (doc) {
    case "REWARDS_CUSTODY_SYSTEM_DESIGN.md":
      return path.join(process.cwd(), "REWARDS_CUSTODY_SYSTEM_DESIGN.md");
    case "Travel Booking.md":
      return path.join(process.cwd(), "Travel Booking.md");
    case "Stock Intelligence Platform.md":
      return path.join(process.cwd(), "Stock Intelligence Platform.md");
  }
}

async function mermaidBlocks(doc: DesignDoc): Promise<string[]> {
  "use cache";
  const markdown = await readFile(docPath(doc), "utf8");
  const blocks: string[] = [];
  const pattern = /```mermaid\r?\n([\s\S]*?)```/g;
  for (const match of markdown.matchAll(pattern)) {
    blocks.push(match[ 1 ].trim());
  }
  return blocks;
}

export async function getDiagramSource(ref: DiagramRef): Promise<string> {
  const blocks = await mermaidBlocks(ref.doc);
  const source = blocks[ ref.index ];
  if (!source) {
    throw new Error(`Mermaid block ${ref.index} not found in ${ref.doc}`);
  }
  return source;
}
