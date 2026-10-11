import Link from 'next/link';
import { getMatches, getSettings, getTeams } from '@/lib/data';
import MatchRow from '@/components/MatchRow';
import ContactCTA from '@/components/ContactCTA';
import { roundName } from '@/lib/bracket';

export default async function Home() {
  const [teams, matches, settings] = await Promise.all([getTeams(), getMatches(), getSettings()]);
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const players = teams.reduce((n, t) => n + t.members.length, 0);
  const real = matches.filter((m) => !(m.round === 1 && (m.team1_id == null) !== (m.team2_id == null)));
  const played = real.filter((m) => m.winner_id != null).length;
  const rounds = matches.length ? Math.max(...matches.map((m) => m.round)) : 0;
  const upcoming = real
    .filter((m) => m.winner_id == null && m.team1_id && m.team2_id)
    .sort((a, b) => (a.scheduled_at ?? '9').localeCompare(b.scheduled_at ?? '9'))
    .slice(0, 4);
  const recent = real
    .filter((m) => m.winner_id != null)
    .sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''))
    .slice(0, 4);
  const labelOf = (m: any) => (m.third_place ? '3er lugar' : roundName(m.round, rounds));

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-kicker">
            {settings.registration_open ? <><b>●</b> Inscripciones abiertas</> : <>Inscripciones cerradas</>}
            <span style={{ opacity: .4 }}>|</span> Inscripción $1.500 por jugador <span style={{ opacity: .4 }}>|</span> Eliminación directa
          </span>
          <img className="hero-logo" src="/logo.png" alt="Logo Torneo 5vs5 UdeC 2026" />
          <h1>
            Torneo <span className="y">5vs5</span>
            <br />
            <span className="y">UdeC</span> 2026
          </h1>
          <p className="lead">Arma tu equipo de cinco, entra con Discord y pelea por el primer lugar. Semifinales y final al mejor de 3.</p>
          <div className="hero-cta">
            <Link className="btn lg" href="/inscripcion">¡Inscríbete ya!</Link>
            <Link className="btn ghost lg" href="/cuadro">Ver el cuadro</Link>
          </div>

          <div className="prizes">
            <div className="prize second">
              <div className="ico">🥈</div>
              <div className="place">2do lugar</div>
              <div className="amount">$35.000</div>
            </div>
            <div className="prize first">
              <div className="ico">🏆</div>
              <div className="place">1er lugar</div>
              <div className="amount">$50.000</div>
            </div>
            <div className="prize third">
              <div className="ico">🥉</div>
              <div className="place">3er lugar</div>
              <div className="amount">$25.000</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="section">
          <div className="stats">
            <div className="panel stat"><div className="n">{teams.length}</div><div className="l">Equipos inscritos</div></div>
            <div className="panel stat"><div className="n">{players}</div><div className="l">Jugadores</div></div>
            <div className="panel stat"><div className="n">{played}<span className="muted" style={{ fontSize: 22 }}>/{real.length || '–'}</span></div><div className="l">Partidos jugados</div></div>
            <div className="panel stat"><div className="n" style={{ color: 'var(--gold)' }}>$110K</div><div className="l">En premios</div></div>
          </div>
        </div>

        <div className="section" id="inscribete">
          <div className="section-head">
            <h2 className="section-title">Inscríbete <span className="fee-inline">$1.500 por jugador</span></h2>
            <Link className="link-more" href="/inscripcion">Qué necesitas →</Link>
          </div>
          <ContactCTA settings={settings} />
        </div>

        {upcoming.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2 className="section-title">Próximos partidos</h2>
              <Link className="link-more" href="/calendario">Ver calendario →</Link>
            </div>
            <div className="panel">
              {upcoming.map((m) => <MatchRow key={m.id} m={m} teams={teamMap} label={labelOf(m)} />)}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2 className="section-title">Últimos resultados</h2>
              <Link className="link-more" href="/cuadro">Ver cuadro →</Link>
            </div>
            <div className="panel">
              {recent.map((m) => <MatchRow key={m.id} m={m} teams={teamMap} label={labelOf(m)} />)}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-head">
            <h2 className="section-title">Inscríbete con Discord</h2>
            <Link className="link-more" href="/reglamento">Leer reglamento →</Link>
          </div>
          <div className="steps">
            <div className="panel step">
              <div className="num">01</div>
              <h3>Entra con Discord</h3>
              <p>Tu cuenta del torneo queda ligada a tu Discord. Así sabemos que cada jugador es quien dice ser.</p>
            </div>
            <div className="panel step">
              <div className="num">02</div>
              <h3>Completa tu perfil</h3>
              <p>Agrega tu Riot ID, tu rango y el rol que juegas. Aparecerás en la lista de jugadores.</p>
            </div>
            <div className="panel step">
              <div className="num">03</div>
              <h3>Crea o únete a un equipo</h3>
              <p>El capitán crea el equipo y comparte un código. Con 5 jugadores (más 2 suplentes opcionales) ya están dentro.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
