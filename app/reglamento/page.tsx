import { REGLAMENTO } from '@/lib/reglamento';

export const metadata = { title: 'Reglamento · Torneo 5vs5 UdeC 2026' };

export default function ReglamentoPage() {
  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Lee antes de jugar</div>
        <h1 className="title">Reglamento</h1>
        <p className="subtitle">Al inscribirse, todos los jugadores aceptan estas reglas.</p>
      </div>
      <div className="rules">
        <nav className="rules-toc">
          {REGLAMENTO.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}
        </nav>
        <div>
          {REGLAMENTO.map((s, i) => (
            <section key={s.id} id={s.id} className="panel rule-sec">
              <h2><span style={{ color: 'var(--red)' }}>{String(i + 1).padStart(2, '0')}</span> {s.title}</h2>
              <ul>{s.items.map((it, k) => <li key={k}>{it}</li>)}</ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
