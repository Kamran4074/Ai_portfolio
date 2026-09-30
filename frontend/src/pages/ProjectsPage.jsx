import { Link } from 'react-router-dom'
import { projects } from '../data/projects'

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured)
  const other = projects.filter((p) => !p.featured)

  return (
    <div className="min-h-screen bg-[#05060a] px-6 pt-28 pb-16 text-white sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeftIcon />
          Back home
        </Link>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Work
          </span>{' '}
          &amp; Projects
        </h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          A selection of AI/ML systems I've built — RAG applications, computer
          vision, and full-stack AI products. Ask the assistant for more
          detail on any of these.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {other.length > 0 && (
          <>
            <h2 className="mt-16 text-xl font-semibold text-gray-200">
              Other projects
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {other.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/40">
      {project.featured && (
        <span className="mb-3 inline-block w-fit rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
          Featured
        </span>
      )}
      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
      <p className="mt-1 text-sm text-violet-300">{project.subtitle}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <GithubIcon />
          View on GitHub
        </a>
      )}
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.1 3.29 9.42 7.86 10.96.57.1.78-.25.78-.55v-2.1c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.08.78 2.18v3.24c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}
