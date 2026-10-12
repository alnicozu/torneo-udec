import Link from 'next/link';
import Avatar from '@/components/Avatar';
import TeamBadge from '@/components/TeamBadge';
import { getTeams, MIN_ROSTER } from '@/lib/data';

export const metadata = { title: 'Equipos · Torneo 5vs5 UdeC 2026' };

export default async function EquiposPage() {
  const teams = await getTeams();
  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">{teams.length} inscritos</div>
        <h1 className="title">Equipos</h1>
        <p className="subtitle">Un equipo queda completo con {MIN_ROSTER} jugadores. Pueden sumar hasta 2 suplentes.</p>
      </div>
      {teams.length === 0 ? (
        <div className="empty">Aún no hay equipos inscritos. ¡Sé el primero!</div>
      ) : (
        <div className="grid cols-3">
          {teams.map((t) => {
            const ok = t.members.length >= MIN_ROSTER;
            return (
              <Link key={t.id} href={`/equipos/${t.id}`} className="panel team-card">
                <div className="team-top">
                  <TeamBadge team={t} />
                  <div style={{ minWidth: 0 }}>
                    <div className="team-name-lg">{t.name}</div>
                    <div className="small muted">{t.members.length} jugadores</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="roster-mini">
                    {t.members.slice(0, 7).map((m) => <Avatar key={m.id} src={m.avatar} name={m.name} />)}
                  </div>
                  <span className={`tag ${ok ? 'ok' : 'gold'}`}>{ok ? 'Completo' : `Faltan ${MIN_ROSTER - t.members.length}`}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
