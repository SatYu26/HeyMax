const MERMAID_URL =
  "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

type Mermaid = {
  initialize(config: Record<string, unknown>): void;
  render(id: string, code: string): Promise<{ svg: string }>;
};

let loader: Promise<Mermaid> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function loadMermaid(): Promise<Mermaid> {
  loader ??= import(/* webpackIgnore: true */ MERMAID_URL).then((mod) => {
    const mermaid = mod.default as Mermaid;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      themeVariables: {
        primaryColor: "#eef2ff",
        primaryBorderColor: "#818cf8",
        primaryTextColor: "#1e1b4b",
        lineColor: "#64748b",
        secondaryColor: "#f1f5f9",
        tertiaryColor: "#f8fafc",
        clusterBkg: "#f8fafc",
        clusterBorder: "#cbd5e1",
        fontSize: "15px",
      },
      flowchart: { curve: "basis", padding: 14 },
    });
    return mermaid;
  });
  return loader;
}

/** Renders one diagram at a time; Mermaid is not safe to run concurrently. */
export function renderMermaid(id: string, code: string): Promise<string> {
  const job = queue.then(async () => {
    const mermaid = await loadMermaid();
    const { svg } = await mermaid.render(id, code);
    return svg;
  });
  queue = job.catch(() => undefined);
  return job;
}
