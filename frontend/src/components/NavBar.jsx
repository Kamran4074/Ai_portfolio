import { useState } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', href: 'mailto:mozammilsiddique2a@gmail.com' },
]

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[#05060a]/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="h-[2px] w-6 bg-linear-to-r from-violet-400 to-cyan-400" />
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-white">
            Mozammil
          </span>
        </Link>

        <ul className="hidden items-center gap-8 sm:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              {link.to ? (
                <Link
                  to={link.to}
                  className="text-sm text-gray-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="text-sm text-gray-300 transition hover:text-white"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="flex h-9 w-9 items-center justify-center text-white sm:hidden"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </nav>

      {menuOpen && (
        <ul className="flex flex-col gap-1 border-t border-white/5 px-6 py-3 sm:hidden">
          {LINKS.map((link) => (
            <li key={link.label}>
              {link.to ? (
                <Link
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

function MenuIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
