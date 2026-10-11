import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getTeam, getUser } from '@/lib/data';

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const user = await getUser(decodeURIComponent(params.id));
  if (!user) notFound();
  const team = user.team_id ? await getTeam(user.team_id) : null;
  return (
    <div className="container">
      <div className="page-head">
        <Link href="/jugadores" className="link-more">← Jugadores</Link>
        <div className="profile-head" style={{ marginTop: 18 }}>
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div>
            <h1 className="title" style={{ marginTop: 0 }}>{user.name}</h1>
            <div className="muted" style={{ marginTop: 8 }}>{user.riot_id ?? 'Sin Riot ID registrado'}</div>
          </div>
        </div>
        <div className="kv">
          <div className="panel"><div className="k">Equipo</div><div className="v">{team ? <Link href={`/equipos/${team.id}`}>{team.name}</Link> : 'Agente libre'}</div></div>
          <div className="panel"><div className="k">Rol</div><div className="v">{user.role ?? '—'}</div></div>
          <div className="panel"><div className="k">Rango</div><div className="v">{user.rank ?? '—'}</div></div>
          <div className="panel"><div className="k">Posición</div><div className="v">{team?.captain_id === user.id ? 'Capitán' : team ? 'Jugador' : '—'}</div></div>
        </div>
      </div>
    </div>
  );
}
