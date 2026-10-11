import Link from 'next/link';
import ContactCTA from '@/components/ContactCTA';
import { getSettings } from '@/lib/data';

export const metadata = { title: 'Inscripción · Torneo 5vs5 UdeC 2026' };

export default async function InscripcionPage() {
  const settings = await getSettings();
  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <div className="eyebrow">{settings.registration_open ? 'Inscripciones abiertas' : 'Inscripciones cerradas'}</div>
        <h1 className="title">Inscribe a tu equipo</h1>
        <p className="subtitle">
          Escríbenos por WhatsApp o Instagram con el nombre de tu equipo y los Riot ID de los 5 jugadores (más suplentes, si tienen).
          Te respondemos con los datos para pagar la inscripción ($1.500) y confirmarte el cupo.
        </p>
      </div>

      <div className="fee-box">
        <span className="fee-l">Valor de inscripción</span>
        <span className="fee-n">$1.500</span>
      </div>

      <ContactCTA settings={settings} />

      <div className="panel pad" style={{ marginTop: 16 }}>
        <h2 className="section-title" style={{ fontSize: 20 }}>Qué necesitas enviarnos</h2>
        <ul style={{ margin: '12px 0 0', paddingLeft: 20, color: '#d6d9f2' }}>
          <li>Nombre del equipo y un tag corto (ej: UDC).</li>
          <li>Riot ID de cada jugador (Nombre#TAG). Mínimo 5, máximo 7 con suplentes.</li>
          <li>Quién será el capitán y su usuario de Discord.</li>
        </ul>
        <p className="muted small" style={{ marginTop: 16, marginBottom: 0 }}>
          Antes de inscribirte, lee el <Link href="/reglamento" style={{ color: 'var(--text)', fontWeight: 700 }}>reglamento</Link>.
          También puedes armar tu equipo directamente en la página en <Link href="/cuenta" style={{ color: 'var(--text)', fontWeight: 700 }}>Mi cuenta</Link> entrando con Discord.
        </p>
      </div>
    </div>
  );
}
