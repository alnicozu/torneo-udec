import { formatWhen, type Match, type Team } from '@/lib/data';

export default function MatchRow({ m, teams, label }: { m: Match; teams: Map<number, Team>; label?: string }) {
  const t1 = m.team1_id ? teams.get(m.team1_id) : null;
  const t2 = m.team2_id ? teams.get(m.team2_id) : null;
  const played = m.winner_id != null && t1 && t2;
  const cls = (id: number | null) => (!played ? '' : m.winner_id === id ? 'win' : 'lose');
  return (
    <div className="match-row">
      <div className="when">{formatWhen(m.scheduled_at) ?? 'Por definir'}</div>
      <div className={`t1 team-name ${cls(m.team1_id)}`}>{t1?.name ?? <span className="muted">Por definir</span>}</div>
      <div className={`score ${played ? '' : 'vs'}`}>{played ? `${m.score1} - ${m.score2}` : 'VS'}</div>
      <div className={`team-name ${cls(m.team2_id)}`}>{t2?.name ?? <span className="muted">Por definir</span>}</div>
      <div className="meta">
        {label && <span className="tag" style={{ marginRight: 6 }}>{label}</span>}
        <span className={`tag ${m.best_of > 1 ? 'gold' : ''}`}>BO{m.best_of}</span>
      </div>
    </div>
  );
}
