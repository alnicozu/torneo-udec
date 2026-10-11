import Link from 'next/link';
import { redirect } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getCurrentUser } from '@/lib/auth';
import { q } from '@/lib/db';
import { getSettings, getTeam, getUser, MAX_ROSTER, MIN_ROSTER, RANKS, ROLES } from '@/lib/data';
import { createTeam, joinTeam, kickMember, leaveTeam, newInviteCode, updateProfile } from './actions';

export const metadata = { title: 'Mi cuenta · Torneo 5vs5 UdeC 2026' };

export default async function CuentaPage({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const session = await getCurrentUser();
  if (!session) redirect('/ingresar');
  const [user, settings] = await Promise.all([getUser(session.id), getSettings()]);
  if (!user) redirect('/ingresar');
  const team = user.team_id ? await getTeam(user.team_id) : null;
  const isCaptain = team?.captain_id === user.id;
  const [{ n: bracketSize }] = await q('select count(*)::int as n from matches');
  const closed = !settings.registration_open || bracketSize > 0;

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <div className="profile-head">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div>
            <div className="eyebrow">Mi cuenta</div>
            <h1 className="title" style={{ fontSize: 44 }}>{user.name}</h1>
            <Link className="link-more" href={`/jugadores/${encodeURIComponent(user.id)}`}>Ver mi perfil público →</Link>
            <div className="small muted" style={{ marginTop: 6 }}>
              Tu ID de Discord: <code style={{ color: 'var(--text)' }}>{user.id}</code>
              {session.isAdmin ? <span className="tag ok" style={{ marginLeft: 8 }}>Admin</span> : null}
            </div>
          </div>
        </div>
      </div>

      {searchParams.ok && <div className="alert ok">{searchParams.ok}</div>}
      {searchParams.err && <div className="alert err">{searchParams.err}</div>}

      <section className="panel pad">
        <h2 className="section-title" style={{ fontSize: 22 }}>1 · Tu perfil de jugador</h2>
        <p className="muted small" style={{ marginTop: 4 }}>El Riot ID es obligatorio para inscribirte en un equipo.</p>
        <form action={updateProfile} style={{ marginTop: 16 }}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="riot_id">Riot ID</label>
              <input className="input" id="riot_id" name="riot_id" placeholder="Nombre#TAG" defaultValue={user.riot_id ?? ''} />
            </div>
            <div className="field">
              <label htmlFor="rank">Rango actual</label>
              <select className="input" id="rank" name="rank" defaultValue={user.rank ?? ''}>
                <option value="">Sin especificar</option>
                {RANKS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="role">Rol principal</label>
              <select className="input" id="role" name="role" defaultValue={user.role ?? ''}>
                <option value="">Sin especificar</option>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions"><button className="btn">Guardar perfil</button></div>
        </form>
      </section>

      <section className="panel pad" style={{ marginTop: 16 }}>
        <h2 className="section-title" style={{ fontSize: 22 }}>2 · Tu equipo</h2>
        {team ? (
          <>
            <div className="team-top" style={{ marginTop: 16 }}>
              <div className="team-badge">{team.tag}</div>
              <div>
                <Link href={`/equipos/${team.id}`} className="team-name-lg">{team.name}</Link>
                <div className="small muted">
                  {team.members.length}/{MAX_ROSTER} jugadores ·{' '}
                  {team.members.length >= MIN_ROSTER ? <span style={{ color: 'var(--ok)' }}>equipo completo</span> : <span style={{ color: 'var(--gold)' }}>faltan {MIN_ROSTER - team.members.length} para completar</span>}
                </div>
              </div>
            </div>

            {isCaptain && (
              <div style={{ marginTop: 20 }}>
                <div className="field"><label>Código de invitación</label></div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                  <span className="code-box">{team.invite_code}</span>
                  <form action={newInviteCode}><button className="btn ghost sm">Generar otro código</button></form>
                </div>
                <p className="muted small">Tus compañeros entran con Discord, van a "Mi cuenta" y escriben este código.</p>
              </div>
            )}

            <div className="panel" style={{ marginTop: 16, overflowX: 'auto' }}>
              <table className="table">
                <tbody>
                  {team.members.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="player-cell">
                          <Avatar src={m.avatar} name={m.name} />
                          <span>{m.name} {m.id === team.captain_id && <span className="tag gold" style={{ marginLeft: 6 }}>Capitán</span>}<div className="riot">{m.riot_id ?? 'Sin Riot ID'}</div></span>
                        </div>
                      </td>
                      <td className="hide-sm">{m.role ?? '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {isCaptain && m.id !== user.id && (
                          <form action={kickMember}>
                            <input type="hidden" name="user_id" value={m.id} />
                            <button className="btn danger sm">Quitar</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form action={leaveTeam} className="form-actions">
              <button className="btn danger">{isCaptain && team.members.length === 1 ? 'Eliminar equipo' : 'Salir del equipo'}</button>
            </form>
          </>
        ) : closed ? (
          <p className="muted">Las inscripciones están cerradas{bracketSize > 0 ? ' y el cuadro ya fue publicado' : ''}. Tu perfil igual aparece en la lista de jugadores.</p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 16 }}>
            <form action={createTeam} className="panel pad">
              <h3 style={{ fontSize: 17 }}>Crear un equipo</h3>
              <p className="muted small" style={{ margin: '4px 0 14px' }}>Serás el capitán y recibirás un código para invitar.</p>
              <div className="field"><label htmlFor="name">Nombre del equipo</label><input className="input" id="name" name="name" maxLength={30} required /></div>
              <div className="field" style={{ marginTop: 12 }}><label htmlFor="tag">Tag (2–5 letras)</label><input className="input" id="tag" name="tag" maxLength={5} placeholder="UDC" required style={{ textTransform: 'uppercase' }} /></div>
              <div className="form-actions"><button className="btn">Crear equipo</button></div>
            </form>
            <form action={joinTeam} className="panel pad">
              <h3 style={{ fontSize: 17 }}>Unirme con un código</h3>
              <p className="muted small" style={{ margin: '4px 0 14px' }}>Pídele el código de 6 caracteres a tu capitán.</p>
              <div className="field"><label htmlFor="code">Código</label><input className="input" id="code" name="code" maxLength={12} placeholder="ABC123" required style={{ textTransform: 'uppercase', letterSpacing: 3 }} /></div>
              <div className="form-actions"><button className="btn">Unirme</button></div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
