import { Diagram } from "@/components/Diagram";
import type { Chapter, DiagramRef } from "@/content/types";
import { getDiagramSource } from "@/lib/diagrams";

async function DiagramBlock({ diagram }: { diagram: DiagramRef }) {
  const source = await getDiagramSource(diagram);
  return (
    <Diagram
      source={source}
      title={diagram.title}
      caption={diagram.caption}
      height={diagram.height}
    />
  );
}

export function ChapterSection({ chapter }: { chapter: Chapter }) {
  return (
    <section id={chapter.id} className="scroll-mt-24 space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{chapter.title}</h2>
      {chapter.intro && <p className="leading-7 text-slate-700">{chapter.intro}</p>}

      {chapter.diagram && <DiagramBlock diagram={chapter.diagram} />}

      {chapter.steps && (
        <ol className="space-y-3">
          {chapter.steps.map((step, i) => (
            <li key={step} className="flex gap-3 text-slate-700">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                {i + 1}
              </span>
              <span className="leading-6">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {chapter.points && (
        <div className="grid gap-4 sm:grid-cols-2">
          {chapter.points.map((point) => (
            <div key={point.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{point.body}</p>
            </div>
          ))}
        </div>
      )}

      {chapter.code && (
        <figure>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-5 font-mono text-sm leading-6 text-slate-100">
            <code>{chapter.code.code}</code>
          </pre>
          {chapter.code.caption && (
            <figcaption className="mt-2 text-sm text-slate-500">{chapter.code.caption}</figcaption>
          )}
        </figure>
      )}

      {chapter.table && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {chapter.table.headers.map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {chapter.table.rows.map((row) => (
                <tr key={row.join("|")} className="align-top">
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3 ${i === 0 ? "font-medium text-slate-900" : "text-slate-700"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
