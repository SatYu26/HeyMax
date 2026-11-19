import Link from "next/link";
import { SneezeButton } from "@/components/SneezeButton";
import { confession, fit, profile } from "@/content/profile";
import { projects } from "@/content/projects";

const linkLabels: Record<keyof typeof profile.links, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  github: "GitHub",
  resume: "Résumé",
};

export default function Home() {
  const links = Object.entries(profile.links).filter(([, href]) => href) as [
    keyof typeof profile.links,
    string,
  ][];

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-20 sm:py-28">
        <p className="text-sm font-medium uppercase tracking-wider text-indigo-600">
          Prepared for the HeyMax engineering conversation
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Hi, I&apos;m {profile.name}. I ship reliable fintech, rewards and
          travel systems, end to end.
        </h1>
        <p className="mt-4 text-sm font-medium text-slate-500">
          {profile.headline}
        </p>
        <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-slate-600">
          {profile.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#projects"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Explore the projects
          </Link>
          <Link
            href="#confession"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Yes, this is a bit much ↓
          </Link>
          {links.map(([key, href]) => (
            <a
              key={key}
              href={key === "email" ? `mailto:${href}` : href}
              target={key === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {linkLabels[key]}
            </a>
          ))}
        </div>
      </section>

      <section id="projects" className="scroll-mt-20 pb-20">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Three systems, three different engineering problems
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          Each project covers the architecture, the main workflows and the
          technical decisions and trade-offs behind them. I&apos;ve prepared all
          three in depth, so we can start wherever is most interesting to you.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {project.domain}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{project.subtitle}</p>
              <p className="mt-4 flex-1 text-slate-700">{project.context}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                  >
                    {h}
                  </li>
                ))}
              </ul>
              <span className="mt-6 text-sm font-medium text-indigo-600 group-hover:text-indigo-800">
                Explore the system design →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="fit"
        className="scroll-mt-20 border-t border-slate-200 py-20"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Why I&apos;d be a good fit for HeyMax
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          HeyMax is looking for hands-on engineers who turn ambiguous product
          ideas into reliable systems, use AI tools well, and own the outcome.
          Here&apos;s how that maps to my work, with fintech and rewards
          experience as a bonus.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fit.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="confession"
        className="scroll-mt-20 border-t border-slate-200 py-20"
      >
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-8 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-600">
            A small confession
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {confession.title}
          </h2>
          <div className="mt-4 max-w-3xl space-y-3 leading-7 text-slate-700">
            {confession.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            {confession.facts.map((fact) => (
              <li key={fact} className="flex gap-2">
                <span aria-hidden>✦</span>
                {fact}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <SneezeButton />
          </div>
        </div>
      </section>
    </div>
  );
}
