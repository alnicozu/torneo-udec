import '@fontsource/anton';
import '@fontsource-variable/inter';
import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Avatar from '@/components/Avatar';
import { SignInButton, SignOutButton } from '@/components/AuthButtons';
import { getCurrentUser, discordEnabled } from '@/lib/auth';
import { getSettings, whatsappLink } from '@/lib/data';
import { isDemo } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://torneo-udec.vercel.app';
const DESCRIPTION = 'Torneo 5vs5 de eliminación directa. 1er lugar $50.000 · 2do $35.000 · 3er $25.000. Inscripción $7.500 por equipo.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Torneo 5vs5 UdeC 2026',
  description: DESCRIPTION,
  openGraph: {
    title: 'Torneo 5vs5 UdeC 2026',
    description: DESCRIPTION,
    url: '/',
    siteName: 'Torneo 5vs5 UdeC 2026',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Torneo 5vs5 UdeC 2026' }],
  },
  twitter: { card: 'summary_large_image', title: 'Torneo 5vs5 UdeC 2026', description: DESCRIPTION, images: ['/og.jpg'] },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const socials = [
    { k: 'facebook', label: 'Facebook', d: 'M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.7-.6Z' },
    { k: 'instagram', label: 'Instagram', d: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z' },
    { k: 'x', label: 'X', d: 'M4 4l7 9-7 7h2l6-6 4.5 6H20l-7.3-9.6L19 4h-2l-5.2 5.2L8 4H4Z' },
    { k: 'tiktok', label: 'TikTok', d: 'M15 3c.4 2.4 1.9 3.9 4.5 4v3c-1.7 0-3.2-.5-4.5-1.4V15a6 6 0 1 1-6-6v3.2a2.8 2.8 0 1 0 2.8 2.8V3H15Z' },
    { k: 'discord_invite', label: 'Discord', d: 'M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.2a18 18 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.8 19.8 0 0 0 6 3l1.3-2.1c-.7-.3-1.4-.6-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1L18 21a19.7 19.7 0 0 0 6-3c.5-5.1-.8-9.6-3.7-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z' },
    { k: 'whatsapp', label: 'WhatsApp', d: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7a11.6 11.6 0 0 1-4.6-4c-.4-.5-1-1.6-1-2.8 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z' },
  ]
    .filter((s) => (settings as any)[s.k])
    .map((s) => ({ ...s, href: s.k === 'whatsapp' ? whatsappLink(settings.whatsapp) : (settings as any)[s.k] }))
    .filter((s) => s.href);

  return (
    <html lang="es">
      <body>
        {isDemo && (
          <div className="demo-bar">
            Modo demo: los datos son de ejemplo y se reinician. Conecta la base de datos y Discord para usarla de verdad.
          </div>
        )}
        {settings.announcement && (
          <div className="announce-bar">
            <div className="container announce-inner">
              <span className="announce-tag">Anuncio</span>
              <span>{settings.announcement}</span>
            </div>
          </div>
        )}
        <header className="header">
          <div className="container header-inner">
            <Link href="/" className="logo">
              <img className="logo-img" src="/logo-sm.png" alt="Torneo 5vs5" width={40} height={40} />
              <span>TORNEO <span className="y">UDEC</span> 2026</span>
            </Link>
            <Nav />
            <div className="user-area">
              {user ? (
                <details className="dropdown">
                  <summary>
                    <Avatar src={user.image} name={user.name} />
                  </summary>
                  <div className="dropdown-menu">
                    <div className="who">Conectado como <b style={{ color: 'var(--text)' }}>{user.name}</b></div>
                    <a href="/cuenta">Mi cuenta y equipo</a>
                    {user.isAdmin && <a href="/admin">Panel de admin</a>}
                    <SignOutButton />
                  </div>
                </details>
              ) : (
                <SignInButton demo={!discordEnabled} label="Entrar" />
              )}
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container footer-inner">
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--text)' }}>TORNEO 5VS5 UDEC 2026</div>
              <div>Torneo comunitario. No afiliado ni respaldado por Riot Games.</div>
            </div>
            {socials.length > 0 && (
              <div className="socials">
                {socials.map((s) => (
                  <a key={s.k} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={s.d} /></svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
