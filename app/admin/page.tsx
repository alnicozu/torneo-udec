import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { roundName } from '@/lib/bracket';
import { getAllUsers, getMatches, getRegCodes, getSettings, getTeams, MIN_ROSTER } from '@/lib/data';
import { adminDeletePlayer, adminRemoveFromTeam, adminRemoveTeamLogo, createRegCode, deleteRegCode, createBracket, deleteBracket, deleteTeam, saveMatch, saveSettings } from './actions';
import ConfirmButton from '@/components/ConfirmButton';
import Avatar from '@/components/Avatar';
import TeamBadge from '@/components/TeamBadge';

export const metadata = { title: 'Admin · Torneo 5vs5 UdeC 2026' };

export default async function AdminPage({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect('/');
  const [teams, matches, settings, users, codes] = await Promise.all([getTeams(), getMatches(), getSettings(), getAllUsers(), getRegCodes()]);
  const freeCodes = codes.filter((c) => !c.team_id).length;
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
          <a className="btn ghost sm" href="#ajustes">Anuncio</a>
          <a className="btn ghost sm" href="#codigos">Códigos</a>
          <a className="btn ghost sm" href="#cuadro">Cuadro</a>
          <a className="btn ghost sm" href="#partidos">Resultados</a>
          <a className="btn ghost sm" href="#equipos">Equipos</a>
          <a className="btn ghost sm" href="#jugadores">Jugadores</a>
          <a className="btn ghost sm" href="#ajustes">Ajustes</a>
        </div>
      </div>

      {searchParams.ok && <div className="alert ok">{searchParams.ok}</div>}
      {searchParams.err && <div className="alert err">{searchParams.err}</div>}

      <section id="codigos" className="panel pad" style={{ scrollMarginTop: 90, marginBottom: 16 }}>
        <h2 className="section-title" style={{ fontSize: 22 }}>Códigos de inscripción</h2>
        <p className="muted small" style={{ marginTop: 4 }}>
          Para crear un equipo se necesita uno de estos códigos. Genera uno cuando alguien pague y envíaselo al capitán. Cada código sirve para <b>un solo equipo</b>.
          Si eliminas un equipo, su código queda libre de nuevo.
        </p>
        <form action={createRegCode} className="form-row" style={{ alignItems: 'end', marginTop: 12 }}>
          <div className="field"><label htmlFor="note">Nota (opcional)</label><input className="input" id="note" name="note" maxLength={80} placeholder="Ej: pagó Juan por WhatsApp" /></div>
          <div><button className="btn">Generar código</button></div>
        </form>
        {codes.length > 0 && (
          <div className="panel" style={{ overflowX: 'auto', marginTop: 16 }}>
            <table className="table">
              <thead><tr><th>Código</th><th>Estado</th><th className="hide-sm">Nota</th><th></th></tr></thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.code}>
                    <td style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: 1, color: c.team_id ? 'var(--muted)' : 'var(--gold)' }}>{c.code}</td>
                    <td>{c.team_id ? <span className="tag violet">Usado · {c.team_name}</span> : <span className="tag ok">Disponible</span>}</td>
                    <td className="hide-sm muted small">{c.note ?? ''}</td>
                    <td style={{ textAlign: 'right' }}>
                      {!c.team_id && (
                        <form action={deleteRegCode}>
                          <input type="hidden" name="code" value={c.code} />
                          <ConfirmButton message={`¿Eliminar el código ${c.code}?`}>Eliminar</ConfirmButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted small" style={{ marginBottom: 0, marginTop: 10 }}>{freeCodes} disponibles · {codes.length - freeCodes} usados</p>
      </section>

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
                    <td><Link href={`/equipos/${t.id}`} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}><span className="badge-sm"><TeamBadge team={t} /></span>{t.name}</Link></td>
                    <td><span className={`tag ${t.members.length >= MIN_ROSTER ? 'ok' : 'gold'}`}>{t.members.length}</span></td>
                    <td className="hide-sm" style={{ fontFamily: 'monospace' }}>{t.invite_code}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {t.has_logo && (
                        <form action={adminRemoveTeamLogo}><input type="hidden" name="team_id" value={t.id} /><ConfirmButton className="btn ghost sm" message={`¿Quitar el logo de "${t.name}"?`}>Quitar logo</ConfirmButton></form>
                      )}
                      <form action={deleteTeam}><input type="hidden" name="team_id" value={t.id} /><ConfirmButton message={`¿Eliminar el equipo "${t.name}"? Sus jugadores quedan sin equipo, pero no se borran.`}>Eliminar</ConfirmButton></form>
                      </div>
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
          <div className="field" style={{ marginBottom: 16 }}>
            <label htmlFor="announcement">Anuncio (aparece arriba en todas las páginas · déjalo vacío para ocultarlo)</label>
            <input className="input" id="announcement" name="announcement" maxLength={200} placeholder="Ej: Hoy 19:00 se juega la final · ¡No te la pierdas en En vivo!" defaultValue={settings.announcement} />
          </div>
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
