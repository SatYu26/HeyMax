"use client";

import { useRef, useState } from "react";

type Burst = { id: number; dx: number; miles: number };

function remark(total: number) {
  if (total === 0) return "Go on. Nobody's watching.";
  if (total < 50) return "Bless you.";
  if (total < 200) return "Strong sneeze. Ledger entries written, balances reconciled.";
  if (total < 500) return "Idempotency key accepted. You're still getting miles, though.";
  return "Okay, you found the easter egg. Back to the system designs?";
}

export function SneezeButton() {
  const [total, setTotal] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);

  const sneeze = () => {
    const created: Burst[] = Array.from({ length: 5 }, () => ({
      id: nextId.current++,
      dx: Math.round((Math.random() - 0.5) * 160),
      miles: 1 + Math.floor(Math.random() * 20),
    }));
    setTotal((t) => t + created.reduce((sum, b) => sum + b.miles, 0));
    setBursts((b) => [...b, ...created]);
    const ids = new Set(created.map((b) => b.id));
    setTimeout(() => setBursts((b) => b.filter((x) => !ids.has(x.id))), 1200);
  };

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div className="relative">
        <button
          type="button"
          onClick={sneeze}
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
        >
          Achoo! 🤧
        </button>
        {bursts.map((b) => (
          <span
            key={b.id}
            aria-hidden
            className="sneeze-mile pointer-events-none absolute left-1/2 top-0 whitespace-nowrap text-sm font-semibold text-indigo-600"
            style={{ "--dx": `${b.dx}px` } as React.CSSProperties}
          >
            +{b.miles} ✈
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-600" aria-live="polite">
        <span className="font-semibold text-slate-900">
          {total.toLocaleString()} Max Miles
        </span>{" "}
        sneezed (sadly non-transferable). {remark(total)}
      </p>
    </div>
  );
}
