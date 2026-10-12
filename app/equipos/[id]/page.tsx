import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import TeamBadge from '@/components/TeamBadge';
import MatchRow from '@/components/MatchRow';
import { getMatches, getTeam, getTeams } from '@/lib/data';
import { roundName } from '@/lib/bracket';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [team, teams, matches] = await Promise.all([getTeam(id), getTeams(), getMatches()]);
  if (!team) notFound();
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const rounds = matches.length ? Math.max(...matches.map((m) => m.round)) : 0;
  const mine = matches.filter((m) => (m.team1_id === id || m.team2_id === id) && m.team1_id && m.team2_id);
  const wins = mine.filter((m) => m.winner_id === id).length;
  const losses = mine.filter((m) => m.winner_id != null && m.winner_id !== id).length;

  return (
    <div className="container">
      <div className="page-head">
        <Link href="/equipos" className="link-more">← Equipos</Link>
        <div className="profile-head" style={{ marginTop: 18 }}>
          <TeamBadge team={team} size="xl" />
          <div>
            <h1 className="title" style={{ marginTop: 0 }}>{team.name}</h1>
            <div className="muted" style={{ marginTop: 8 }}>{team.members.length} jugadores · {wins}V – {losses}D</div>
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 8 }}>
        <h2 className="section-title" style={{ marginBottom: 14 }}>Plantel</h2>
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Jugador</th><th>Rol</th><th className="hide-sm">Rango</th></tr></thead>
            <tbody>
              {team.members.map((m) => (
                <tr key={m.id} className="click">
                  <td>
                    <Link href={`/jugadores/${encodeURIComponent(m.id)}`} className="player-cell">
                      <Avatar src={m.avatar} name={m.name} />
                      <span>
                        {m.name} {m.id === team.captain_id && <span className="tag gold" style={{ marginLeft: 6 }}>Capitán</span>}
                        <div className="riot">{m.riot_id ?? 'Sin Riot ID'}</div>
                      </span>
                    </Link>
                  </td>
                  <td>{m.role ?? <span className="muted">—</span>}</td>
                  <td className="hide-sm">{m.rank ?? <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mine.length > 0 && (
        <div className="section">
          <h2 className="section-title" style={{ marginBottom: 14 }}>Partidos</h2>
          <div className="panel">
            {mine.map((m) => <MatchRow key={m.id} m={m} teams={teamMap} label={m.third_place ? '3er lugar' : roundName(m.round, rounds)} />)}
          </div>
        </div>
      )}
    </div>
  );
}
