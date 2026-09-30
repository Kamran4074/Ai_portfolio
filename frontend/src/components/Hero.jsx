import { Link } from 'react-router-dom'
import NetworkBackground from './NetworkBackground'

export default function Hero() {
  return (
    <section className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#05060a]">
      {/* Background layer: dimmed photo + subtle network pattern + soft glows.
          Only ONE darkening overlay below — stacking multiple full-bleed
          translucent-black layers compounds multiplicatively and crushes
          the image to solid black, which is what happened before this. */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover opacity-55"
          style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundPosition: 'center 20%' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 opacity-15">
          <NetworkBackground />
        </div>
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* Single vignette overlay: darkest at top/bottom for text contrast,
          lighter in the middle so the photo is still visible there. */}
      <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black/85" />

      {/* Content — left-aligned, image bleeds across the rest of the frame */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start px-6 pt-16 text-left sm:px-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
          AI Engineer Portfolio
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
          Hi, I&apos;m{' '}
          <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Mozammil
          </span>
          .
        </h1>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
          AI Engineer.
        </h2>
        <p className="mt-6 max-w-lg text-base text-gray-400 sm:text-lg">
          I design practical AI systems — LLMs, RAG pipelines, and computer
          vision that solve real problems.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-blue-500 px-7 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] transition hover:opacity-90"
          >
            View My Work
            <ArrowRightIcon />
          </Link>
          <a
            href="mailto:mozammilsiddique2a@gmail.com"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            Contact Me
            <MailIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" />
    </svg>
  )
}
