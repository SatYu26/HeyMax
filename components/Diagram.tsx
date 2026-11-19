"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { renderMermaid } from "./mermaid";
import { PanZoom } from "./PanZoom";

type State =
  | { status: "loading" }
  | { status: "ready"; svg: string }
  | { status: "error" };

export function Diagram({
  source,
  title,
  caption,
  height = 520,
}: {
  source: string;
  title: string;
  caption?: string;
  height?: number;
}) {
  const id = `mmd-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [state, setState] = useState<State>({ status: "loading" });
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    renderMermaid(id, source)
      .then((svg) => !cancelled && setState({ status: "ready", svg }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [id, source]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-2.5">
        <figcaption className="text-sm font-medium text-slate-800">{title}</figcaption>
        <button
          type="button"
          disabled={state.status !== "ready"}
          onClick={() => setFullscreen(true)}
          className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          ⤢ Full screen
        </button>
      </div>

      <div style={{ height }} className="bg-white">
        {state.status === "loading" && (
          <div className="grid h-full place-items-center text-sm text-slate-400">
            Rendering diagram…
          </div>
        )}
        {state.status === "error" && (
          <div className="h-full overflow-auto p-4">
            <p className="mb-2 text-sm text-slate-500">
              The diagram renderer couldn&apos;t load. Showing the diagram source instead.
            </p>
            <pre className="text-xs text-slate-700">{source}</pre>
          </div>
        )}
        {state.status === "ready" && (
          <PanZoom svg={state.svg} className="h-full" wheelRequiresModifier />
        )}
      </div>

      {caption && (
        <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          {caption}
        </p>
      )}

      {fullscreen &&
        state.status === "ready" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex flex-col bg-white"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">
                  Scroll to zoom · drag to pan · double-click to zoom in · Esc to close
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <PanZoom svg={state.svg} className="flex-1" wheelRequiresModifier={false} />
          </div>,
          document.body,
        )}
    </figure>
  );
}
