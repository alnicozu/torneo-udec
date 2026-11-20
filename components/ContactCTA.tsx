import { instagramHandle, whatsappDisplay, whatsappLink, type Settings } from '@/lib/data';

const WA = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7a11.6 11.6 0 0 1-4.6-4c-.4-.5-1-1.6-1-2.8 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z';
const DC = 'M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.2a18 18 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.8 19.8 0 0 0 6 3l1.3-2.1c-.7-.3-1.4-.6-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1L18 21a19.7 19.7 0 0 0 6-3c.5-5.1-.8-9.6-3.7-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z';
const IG = 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z';

// Cuenta de Instagram por defecto, si aún no se configuró en el panel.
const DEFAULT_IG = 'torneovalorant2026';

/**
 * Contacto para inscribirse. Muestra el @ de Instagram y el número de WhatsApp
 * como texto grande (para buscarlo a mano), con el enlace pequeño debajo.
 */
export default function ContactCTA({ settings }: { settings: Settings }) {
  const handle = instagramHandle(settings.instagram) || DEFAULT_IG;
  const waNum = whatsappDisplay(settings.whatsapp);
  const dcRaw = (settings.discord_invite || '').trim();
  const dcHref = dcRaw ? (/^https?:\/\//.test(dcRaw) ? dcRaw : `https://${dcRaw}`) : null;
  const dcShow = dcRaw.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const items = [
    {
      key: 'ig', cls: 'ig', d: IG, label: 'Instagram', main: `@${handle}`,
      sub: 'Búscanos en Instagram y mándanos un DM',
      href: `https://instagram.com/${handle}`, linkText: `instagram.com/${handle}`,
    },
    {
      key: 'wa', cls: 'wa', d: WA, label: 'WhatsApp', main: waNum,
      sub: 'Escríbenos a este número',
      href: whatsappLink(settings.whatsapp), linkText: 'Abrir chat de WhatsApp',
      soon: 'Pronto publicaremos el número',
    },
    {
      key: 'dc', cls: 'dc', d: DC, label: 'Servidor de Discord', main: dcShow,
      sub: 'Avisos, horarios y coordinación del torneo',
      href: dcHref, linkText: '', cta: 'Unirme al Discord',
      soon: 'Pronto publicaremos la invitación',
    },
  ] as { key: string; cls: string; d: string; label: string; main: string; sub: string; href: string | null; linkText: string; cta?: string; soon?: string }[];
  return (
    <div className="contact-grid">
      {items.map((it) =>
        it.main ? (
          <div key={it.key} className={`contact-card ${it.cls}`}>
            <span className="contact-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d={it.d} /></svg></span>
            <span>
              <span className="contact-k">{it.label}</span>
              <span className="contact-main">{it.main}</span>
              <span className="contact-s">{it.sub}</span>
              {it.href && it.cta && <a className="btn btn-discord sm contact-cta" href={it.href} target="_blank" rel="noreferrer">{it.cta} →</a>}
              {it.href && !it.cta && <a className="contact-link" href={it.href} target="_blank" rel="noreferrer">{it.linkText} ↗</a>}
            </span>
          </div>
        ) : (
          <div key={it.key} className={`contact-card ${it.cls} off`}>
            <span className="contact-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d={it.d} /></svg></span>
            <span><span className="contact-k">{it.label}</span><span className="contact-s">{it.soon ?? 'Pronto'}</span></span>
            <span className="tag">Pronto</span>
          </div>
        )
      )}
    </div>
  );
}
