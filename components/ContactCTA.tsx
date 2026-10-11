import { whatsappLink, type Settings } from '@/lib/data';

const WA = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7a11.6 11.6 0 0 1-4.6-4c-.4-.5-1-1.6-1-2.8 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z';
const IG = 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z';

/** Botones para inscribirse por WhatsApp o Instagram. Si aún no están configurados, muestra "Pronto". */
export default function ContactCTA({ settings }: { settings: Settings }) {
  const wa = whatsappLink(settings.whatsapp);
  const ig = settings.instagram || null;
  const items = [
    { key: 'wa', label: 'WhatsApp', sub: 'Escríbenos y te inscribimos', href: wa, cls: 'wa', d: WA },
    { key: 'ig', label: 'Instagram', sub: 'Mándanos un DM', href: ig, cls: 'ig', d: IG },
  ];
  return (
    <div className="contact-grid">
      {items.map((it) =>
        it.href ? (
          <a key={it.key} className={`contact-card ${it.cls}`} href={it.href} target="_blank" rel="noreferrer">
            <span className="contact-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d={it.d} /></svg></span>
            <span><span className="contact-l">Inscribirme por {it.label}</span><span className="contact-s">{it.sub}</span></span>
            <span className="contact-arrow">→</span>
          </a>
        ) : (
          <div key={it.key} className={`contact-card ${it.cls} off`}>
            <span className="contact-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d={it.d} /></svg></span>
            <span><span className="contact-l">{it.label}</span><span className="contact-s">Pronto publicaremos el contacto</span></span>
            <span className="tag">Pronto</span>
          </div>
        )
      )}
    </div>
  );
}
