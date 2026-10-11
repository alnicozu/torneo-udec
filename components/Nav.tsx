'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/cuadro', label: 'Cuadro' },
  { href: '/equipos', label: 'Equipos' },
  { href: '/jugadores', label: 'Jugadores' },
  { href: '/calendario', label: 'Calendario' },
  { href: '/inscripcion', label: 'Inscripción' },
  { href: '/reglamento', label: 'Reglamento' },
  { href: '/en-vivo', label: 'En vivo', live: true },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const isActive = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));
  return (
    <>
      <nav className={`nav ${open ? 'open' : ''}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={`${isActive(l.href) ? 'active' : ''} ${l.live ? 'live' : ''}`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <button className="menu-btn" aria-label="Menú" onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
    </>
  );
}
