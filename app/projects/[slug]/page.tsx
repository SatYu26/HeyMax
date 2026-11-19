import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { ChapterSection } from "./chapter";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: project.name, description: project.context } : {};
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  const toc = [
    ...project.chapters.map((c) => ({ id: c.id, title: c.title })),
    ...(project.tradeoffs.length
      ? [{ id: "tradeoffs", title: "Trade-offs" }]
      : []),
    ...(project.conversation.length
      ? [{ id: "discuss", title: "Worth discussing" }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/#projects"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← All projects
      </Link>

      <header className="mt-6 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-indigo-600">
          {project.domain}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          {project.name}
        </h1>
        <p className="mt-2 text-lg text-slate-500">{project.subtitle}</p>
        <div className="mt-6 space-y-4 leading-7 text-slate-700">
          {project.overview.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <li
              key={s}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-700"
            >
              {s}
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
              On this page
            </p>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-16">
          {project.chapters.map((chapter) => (
            <ChapterSection key={chapter.id} chapter={chapter} />
          ))}

          {project.tradeoffs.length > 0 && (
            <section id="tradeoffs" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Trade-offs
              </h2>
              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Choice</th>
                      <th className="px-4 py-3 font-medium">Why</th>
                      <th className="px-4 py-3 font-medium">
                        Alternative considered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {project.tradeoffs.map((t) => (
                      <tr key={t.choice} className="align-top">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {t.choice}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{t.why}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {t.alternative}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {project.conversation.length > 0 && (
            <section id="discuss" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Worth discussing
              </h2>
              <p className="mt-3 text-slate-600">
                Areas I&apos;d enjoy going deeper on, or rethinking together.
              </p>
              <ul className="mt-5 space-y-3">
                {project.conversation.map((topic) => (
                  <li key={topic} className="flex gap-3 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {topic}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link
            href={`/projects/${next.slug}`}
            className="group block rounded-2xl border border-slate-200 bg-white p-6 hover:border-indigo-300"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Next project
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
              {next.name} →
            </p>
            <p className="mt-1 text-sm text-slate-500">{next.context}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
