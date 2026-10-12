import { roundName } from '@/lib/bracket';
import { formatWhen, teamLogoUrl, type Match, type Team } from '@/lib/data';

function BMatch({ m, teams, final }: { m: Match; teams: Map<number, Team>; final?: boolean }) {
  const rows = [
    { id: m.team1_id, sc: m.score1 },
    { id: m.team2_id, sc: m.score2 },
  ];
  const isBye = m.round === 1 && (m.team1_id == null) !== (m.team2_id == null);
  const done = m.winner_id != null;
  return (
    <div className={`bm ${done ? 'done' : ''} ${final ? 'final' : ''}`}>
      {rows.map((r, i) => {
        const t = r.id != null ? teams.get(r.id) : null;
        const state = !t ? 'tbd' : done && !isBye ? (m.winner_id === r.id ? 'win' : 'lose') : isBye ? 'win' : '';
        return (
          <div key={i} className={`bm-row ${state}`}>
            <span className="tg">{t?.has_logo ? <img className="bm-logo" src={teamLogoUrl(t)} alt="" /> : t?.tag ?? ''}</span>
            <span className="nm">{t ? <a href={`/equipos/${t.id}`}>{t.name}</a> : isBye ? 'Libre (bye)' : 'Por definir'}</span>
            <span className="sc">{done && !isBye ? r.sc ?? 0 : ''}</span>
          </div>
        );
      })}
      <div className="bm-foot">
        <span>{isBye ? 'Avanza directo' : formatWhen(m.scheduled_at) ?? 'Fecha por definir'}</span>
        <span>BO{m.best_of}</span>
      </div>
    </div>
  );
}

export default function Bracket({ matches, teams }: { matches: Match[]; teams: Map<number, Team> }) {
  const main = matches.filter((m) => !m.third_place);
  const third = matches.find((m) => m.third_place);
  const rounds = Math.max(...main.map((m) => m.round));
  const byRound = Array.from({ length: rounds }, (_, i) =>
    main.filter((m) => m.round === i + 1).sort((a, b) => a.slot - b.slot)
  );
  const final = byRound[rounds - 1]?.[0];
  const champion = final?.winner_id ? teams.get(final.winner_id) : null;

  return (
    <div className="bracket-scroll">
      <div className="bracket" style={{ paddingBottom: Math.max(0, 360 - (byRound[0]?.length ?? 0) * 58) }}>
        {byRound.map((ms, i) => {
          const r = i + 1;
          const isLast = r === rounds;
          const pairs: Match[][] = [];
          for (let k = 0; k < ms.length; k += 2) pairs.push(ms.slice(k, k + 2));
          return (
            <div className="b-round" key={r}>
              <div className="b-round-head">
                <div className="n">{roundName(r, rounds)}</div>
                <div className="bo">AL MEJOR DE {ms[0]?.best_of ?? 1}</div>
              </div>
              <div className="b-col">
                {pairs.map((p, k) => (
                  <div className={`b-pair ${p.length === 1 ? 'single' : ''}`} key={k}>
                    {p.map((m) => (
                      <div className="b-cell" key={m.id}>
                        {isLast ? (
                          <div style={{ position: 'relative', width: '100%' }}>
                            <BMatch m={m} teams={teams} final />
                            <div className="final-extras">
                              {champion && (
                                <div className="champion">
                                  <div className="l">🏆 CAMPEÓN</div>
                                  <div className="n">{champion.name}</div>
                                </div>
                              )}
                              {third && (
                                <div className="third-wrap">
                                  <div className="b-round-head">
                                    <div className="n" style={{ color: 'var(--bronze)' }}>3er lugar</div>
                                    <div className="bo">AL MEJOR DE {third.best_of}</div>
                                  </div>
                                  <BMatch m={third} teams={teams} />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <BMatch m={m} teams={teams} />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
