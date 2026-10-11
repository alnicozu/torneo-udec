import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { roundName } from '@/lib/bracket';
import { getAllUsers, getMatches, getSettings, getTeams, MIN_ROSTER } from '@/lib/data';
import { adminDeletePlayer, adminRemoveFromTeam, createBracket, deleteBracket, deleteTeam, saveMatch, saveSettings } from './actions';
import ConfirmButton from '@/components/ConfirmButton';
import Avatar from '@/components/Avatar';

export const metadata = { title: 'Admin · Torneo 5vs5 UdeC 2026' };

export default async function AdminPage({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect('/');
  const [teams, matches, settings, users] = await Promise.all([getTeams(), getMatches(), getSettings(), getAllUsers()]);
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const rounds = matches.length ? Math.max(...matches.map((m) => m.round)) : 0;
  const full = teams.filter((t) => t.members.length >= MIN_ROSTER).length;
  const editable = matches.filter((m) => !(m.round === 1 && (m.team1_id == null) !== (m.team2_id == null)));

  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Organización</div>
        <h1 className="title">Panel de admin</h1>
        <div className="tabs-inline" style={{ marginTop: 16 }}>
          <a className="btn ghost sm" href="#cuadro">Cuadro</a>
          <a className="btn ghost sm" href="#partidos">Resultados</a>
          <a className="btn ghost sm" href="#equipos">Equipos</a>
          <a className="btn ghost sm" href="#jugadores">Jugadores</a>
          <a className="btn ghost sm" href="#ajustes">Ajustes</a>
        </div>
      </div>

      {searchParams.ok && <div className="alert ok">{searchParams.ok}</div>}
      {searchParams.err && <div className="alert err">{searchParams.err}</div>}

      <section id="cuadro" className="panel pad" style={{ scrollMarginTop: 90 }}>
        <h2 className="section-title" style={{ fontSize: 22 }}>Cuadro</h2>
        {matches.length === 0 ? (
          <form action={createBracket} style={{ marginTop: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>
              Hay {teams.length} equipos inscritos ({full} completos). Al crear el cuadro se cierran las inscripciones.
              Si la cantidad no es potencia de 2 (4, 8, 16…), algunos equipos pasan directo a la segunda ronda.
            </p>
            <div className="form-row">
              <div className="field">
                <label>Orden de los cruces</label>
                <select className="input" name="mode" defaultValue="random">
                  <option value="random">Sorteo al azar</option>
                  <option value="order">Por orden de inscripción (1º vs último)</option>
                </select>
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600, marginTop: 20 }}>
                <input type="checkbox" name="only_full" defaultChecked /> Solo equipos completos ({MIN_ROSTER}+ jugadores)
              </label>
            </div>
            <div className="form-actions"><button className="btn">Crear cuadro</button></div>
          </form>
        ) : (
          <div style={{ marginTop: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>El cuadro está publicado con {matches.filter((m) => m.round === 1).length * 2} cupos. <Link href="/cuadro" style={{ color: 'var(--text)', fontWeight: 700 }}>Ver cuadro →</Link></p>
            <form action={deleteBracket}>
              <button className="btn danger sm">Eliminar cuadro y empezar de nuevo</button>
            </form>
          </div>
        )}
      </section>

      {editable.length > 0 && (
        <section id="partidos" className="section" style={{ scrollMarginTop: 90 }}>
          <h2 className="section-title" style={{ marginBottom: 6 }}>Resultados y horarios</h2>
          <p className="muted small" style={{ marginTop: 0, marginBottom: 14 }}>
            En BO1 escribe 1-0; en BO3, 2-0 o 2-1. Al guardar, el ganador avanza solo. Si corriges un resultado, los partidos siguientes se actualizan.
          </p>
          {Array.from({ length: rounds }, (_, i) => i + 1).map((r) => {
            const ms = editable.filter((m) => m.round === r).sort((a, b) => Number(a.third_place) - Number(b.third_place) || a.slot - b.slot);
            if (!ms.length) return null;
            return (
              <div key={r} style={{ marginBottom: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{roundName(r, rounds)}</div>
                <div className="panel">
                  {ms.map((m) => {
                    const t1 = m.team1_id ? teamMap.get(m.team1_id) : null;
                    const t2 = m.team2_id ? teamMap.get(m.team2_id) : null;
                    const ready = !!(t1 && t2);
                    return (
                      <form key={m.id} action={saveMatch} className="admin-match">
                        <input type="hidden" name="id" value={m.id} />
                        <div className="r">{t1?.name ?? <span className="muted">Por definir</span>}{m.third_place && <div className="tag" style={{ marginTop: 4 }}>3er lugar</div>}</div>
                        <input className="input" name="score1" type="number" min={0} max={Math.ceil(m.best_of / 2)} defaultValue={m.score1 ?? ''} disabled={!ready} aria-label="Marcador equipo 1" />
                        <div className="muted" style={{ textAlign: 'center' }}>–</div>
                        <input className="input" name="score2" type="number" min={0} max={Math.ceil(m.best_of / 2)} defaultValue={m.score2 ?? ''} disabled={!ready} aria-label="Marcador equipo 2" />
                        <div className="l">{t2?.name ?? <span className="muted">Por definir</span>} <span className={`tag ${m.best_of > 1 ? 'gold' : ''}`}>BO{m.best_of}</span></div>
                        <input className="input when-in" name="scheduled_at" type="datetime-local" defaultValue={m.scheduled_at ?? ''} aria-label="Fecha y hora" />
                        <button className="btn sm save">Guardar</button>
                      </form>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section id="equipos" className="section" style={{ scrollMarginTop: 90 }}>
        <h2 className="section-title" style={{ marginBottom: 14 }}>Equipos ({teams.length})</h2>
        {teams.length === 0 ? <div className="empty">Sin equipos todavía.</div> : (
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Equipo</th><th>Jugadores</th><th className="hide-sm">Código</th><th></th></tr></thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id}>
                    <td><Link href={`/equipos/${t.id}`} style={{ fontWeight: 700 }}><span className="tag violet" style={{ marginRight: 8 }}>{t.tag}</span>{t.name}</Link></td>
                    <td><span className={`tag ${t.members.length >= MIN_ROSTER ? 'ok' : 'gold'}`}>{t.members.length}</span></td>
                    <td className="hide-sm" style={{ fontFamily: 'monospace' }}>{t.invite_code}</td>
                    <td style={{ textAlign: 'right' }}>
                      <form action={deleteTeam}><input type="hidden" name="team_id" value={t.id} /><ConfirmButton message={`¿Eliminar el equipo "${t.name}"? Sus jugadores quedan sin equipo, pero no se borran.`}>Eliminar</ConfirmButton></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="jugadores" className="section" style={{ scrollMarginTop: 90 }}>
        <h2 className="section-title" style={{ marginBottom: 6 }}>Jugadores ({users.length})</h2>
        <p className="muted small" style={{ marginTop: 0, marginBottom: 14 }}>
          <b>Quitar del equipo</b> lo deja como agente libre. <b>Eliminar</b> borra su perfil (Riot ID, rango, equipo), pero no lo bloquea: si vuelve a entrar con Discord, empieza de cero.
        </p>
        {users.length === 0 ? <div className="empty">Nadie ha entrado todavía.</div> : (
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Jugador</th><th>Equipo</th><th className="hide-sm">ID de Discord</th><th></th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="player-cell">
                        <Avatar src={u.avatar} name={u.name} />
                        <span>{u.name}<div className="riot">{u.riot_id ?? 'Sin Riot ID'}</div></span>
                      </div>
                    </td>
                    <td>
                      {u.team_id ? <><span className="tag violet" style={{ marginRight: 6 }}>{u.team_tag}</span>{u.is_captain && <span className="tag gold">Capitán</span>}</> : <span className="muted small">Sin equipo</span>}
                    </td>
                    <td className="hide-sm" style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.id}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {u.team_id && (
                          <form action={adminRemoveFromTeam}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <ConfirmButton className="btn ghost sm" message={`¿Quitar a ${u.name} de ${u.team_name}?`}>Quitar del equipo</ConfirmButton>
                          </form>
                        )}
                        <form action={adminDeletePlayer}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <ConfirmButton message={`¿Eliminar a ${u.name}? Se borra su perfil, pero podrá volver a entrar con Discord.`}>Eliminar</ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="ajustes" className="section panel pad" style={{ scrollMarginTop: 90 }}>
        <h2 className="section-title" style={{ fontSize: 22 }}>Ajustes</h2>
        <form key={String(settings.registration_open)} action={saveSettings} style={{ marginTop: 14 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600, marginBottom: 16 }}>
            <input type="checkbox" name="registration_open" defaultChecked={settings.registration_open} /> Inscripciones abiertas
          </label>
          <div className="form-row">
            <div className="field"><label>WhatsApp de inscripciones</label><input className="input" name="whatsapp" placeholder="+56 9 1234 5678" defaultValue={settings.whatsapp} /></div>
            <div className="field"><label>Canal de Twitch</label><input className="input" name="stream_channel" placeholder="nombre_del_canal" defaultValue={settings.stream_channel} /></div>
            <div className="field"><label>Invitación a Discord</label><input className="input" name="discord_invite" placeholder="https://discord.gg/…" defaultValue={settings.discord_invite} /></div>
            <div className="field"><label>Instagram</label><input className="input" name="instagram" placeholder="https://instagram.com/…" defaultValue={settings.instagram} /></div>
            <div className="field"><label>Facebook</label><input className="input" name="facebook" placeholder="https://facebook.com/…" defaultValue={settings.facebook} /></div>
            <div className="field"><label>X (Twitter)</label><input className="input" name="x" placeholder="https://x.com/…" defaultValue={settings.x} /></div>
            <div className="field"><label>TikTok</label><input className="input" name="tiktok" placeholder="https://tiktok.com/@…" defaultValue={settings.tiktok} /></div>
          </div>
          <div className="form-actions"><button className="btn">Guardar ajustes</button></div>
        </form>
      </section>
    </div>
  );
}
