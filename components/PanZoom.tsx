"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type View = { x: number; y: number; k: number };

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;
const IDENTITY: View = { x: 0, y: 0, k: 1 };

function clamp(k: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, k));
}

export function PanZoom({
  svg,
  className,
  wheelRequiresModifier,
}: {
  svg: string;
  className?: string;
  /** Inline viewers only zoom on Ctrl/⌘ + wheel so the page can still scroll. */
  wheelRequiresModifier: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [view, setView] = useState<View>(IDENTITY);
  const [hint, setHint] = useState(false);

  const zoomAt = useCallback((factor: number, px?: number, py?: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = px ?? (rect ? rect.width / 2 : 0);
    const cy = py ?? (rect ? rect.height / 2 : 0);
    setView((v) => {
      const k = clamp(v.k * factor);
      const ratio = k / v.k;
      return { k, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let hintTimer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (wheelRequiresModifier && !(e.ctrlKey || e.metaKey)) {
        setHint(true);
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => setHint(false), 1200);
        return;
      }
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(hintTimer);
    };
  }, [wheelRequiresModifier, zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    drag.current = { id: d.id, x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        ref={containerRef}
        className="diagram-canvas absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          zoomAt(1.6, e.clientX - rect.left, e.clientY - rect.top);
        }}
      >
        <div
          className="absolute inset-0 origin-top-left p-4"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <div className="absolute right-3 top-3 flex gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
        <ToolButton label="Zoom in" onClick={() => zoomAt(1.25)}>+</ToolButton>
        <ToolButton label="Zoom out" onClick={() => zoomAt(0.8)}>−</ToolButton>
        <ToolButton label="Reset view" onClick={() => setView(IDENTITY)}>⟲</ToolButton>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs text-slate-500">
        {Math.round(view.k * 100)}%
      </div>

      {hint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-md bg-slate-900/85 px-3 py-1.5 text-xs text-white">
          Hold Ctrl / ⌘ and scroll to zoom, or open full screen
        </div>
      )}
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-md text-lg leading-none text-slate-700 hover:bg-slate-100"
    >
      {children}
    </button>
  );
}
