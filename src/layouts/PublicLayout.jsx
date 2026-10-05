// src/layouts/PublicLayout.jsx
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const NAV = [
  { label: 'Home',     to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/service' },
  { label: 'Pharmacy', to: '/services' },
  { label: 'Contact',  to: '/contact' },
  { label: 'Login',  to: '/login' },
];

// -------------------- Social icons --------------------
const Socials = [
  {
    name: 'GitHub',
    href: 'https://github.com/',
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.05c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.05.78 2.12v3.14c0 .31.2.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/',
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-7h-2.5V12h2.5V9.8c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.21.2 2.21.2v2.43h-1.24c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.88h-2.3v7A10 10 0 0 0 22 12Z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/',
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.84-2.48V9.77a5.71 5.71 0 1 0 4.93 5.65V8.87a7.36 7.36 0 0 0 4.31 1.38V7.16a4.28 4.28 0 0 1-3.25-1.34Z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/',
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-gray-800">
      {/* ============================================================
          HEADER — dark forest green
      ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#0F2E2A]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white grid place-items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="#0F2E2A" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="8" cy="10" r="1.2" fill="#0F2E2A" />
                <circle cx="16" cy="10" r="1.2" fill="#0F2E2A" />
                <circle cx="12" cy="15" r="1.2" fill="#0F2E2A" />
              </svg>
            </div>
            <p className="text-[20px] font-extrabold tracking-tight text-white">
              Dr Dejene Animal <span className="text-[#F87171]">Clinic</span>
            </p>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-[14px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1E4B44] text-[#F87171]'
                      : 'text-gray-200 hover:text-white'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setOpen(v => !v)}
            aria-label="menu"
          >
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-white/10 bg-[#0F2E2A] px-6 py-3 space-y-1">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-lg text-sm font-semibold ${
                    isActive
                      ? 'bg-[#1E4B44] text-[#F87171]'
                      : 'text-gray-200'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1">{children}</main>

      {/* ============================================================
          FOOTER — same dark forest green
      ============================================================ */}
      <footer className="bg-[#0F2E2A] text-teal-50">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 grid grid-cols-1
                        md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white grid place-items-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                     stroke="#0F2E2A" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="8" cy="10" r="1.2" fill="#0F2E2A" />
                  <circle cx="16" cy="10" r="1.2" fill="#0F2E2A" />
                  <circle cx="12" cy="15" r="1.2" fill="#0F2E2A" />
                </svg>
              </div>
              <p className="text-[16px] font-extrabold text-white">
                Dr Dejene Animal <span className="text-[#F87171]">Clinic</span>
              </p>
            </div>
            <p className="text-sm text-teal-100/70 leading-relaxed max-w-xs">
              Providing compassionate, state-of-the-art veterinary care for your
              beloved pets. Your pet&apos;s health and happiness is our ultimate mission.
            </p>

            <div className="flex items-center gap-2.5 mt-6">
              {Socials.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-teal-600
                             border border-white/10 hover:border-teal-500
                             text-teal-100 hover:text-white
                             grid place-items-center transition-all duration-200
                             hover:-translate-y-0.5"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-5 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { l: 'Home',                 to: '/' },
                { l: 'About Our Clinic',     to: '/about' },
                { l: 'Veterinary Services',  to: '/services' },
                { l: 'Pharmacy & Supplies',  to: '/services' },
                { l: 'Contact',              to: '/contact' },
              ].map(x => (
                <li key={x.l}>
                  <Link
                    to={x.to}
                    className="text-teal-100/70 hover:text-white
                               transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-teal-400 transition-all" />
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-5 tracking-wide">
              Working Hours
            </h4>
            <ul className="space-y-3 text-sm text-teal-100/80">
              {[
                { d: 'Mon – Fri', h: '8:00 AM – 8:00 PM' },
                { d: 'Saturday', h: '9:00 AM – 6:00 PM' },
                { d: 'Sunday',   h: '10:00 AM – 4:00 PM' },
              ].map(r => (
                <li key={r.d} className="flex items-center justify-between gap-4">
                  <span className="text-teal-100/60">{r.d}</span>
                  <span className="text-white font-medium">{r.h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full
                                 rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              24/7 Emergency Care Available
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-5 tracking-wide">
              Emergency Contact
            </h4>

            <div className="flex items-start gap-2 text-sm text-teal-100/80 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   className="mt-0.5 text-teal-400 flex-shrink-0">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Addis Ababa, Ethiopia</span>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-[11px] font-bold text-teal-400 tracking-wider mb-2">
                24/7 HOTLINE
              </p>
              <div className="space-y-1.5">
                <a href="tel:+251910115175"
                   className="flex items-center gap-2 text-sm text-white
                              hover:text-teal-300 transition-colors font-medium">
                  📞 +251 910 115 175
                </a>
                <a href="tel:+251910037682"
                   className="flex items-center gap-2 text-sm text-white
                              hover:text-teal-300 transition-colors font-medium">
                  📞 +251 910 037 682
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row
                          items-center justify-between gap-3 text-xs text-teal-100/50">
            <p>© {new Date().getFullYear()} Dr Dejene Animal Clinic. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Made with
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f43f5e">
                <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
              </svg>
              in Addis Ababa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}