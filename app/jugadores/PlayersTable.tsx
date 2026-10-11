'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Avatar from '@/components/Avatar';

const ROLES = ['Duelista', 'Iniciador', 'Controlador', 'Centinela', 'Flex'];

export default function PlayersTable({ players }: { players: any[] }) {
  const [text, setText] = useState('');
  const [role, setRole] = useState('');
  const list = useMemo(() => {
    const t = text.trim().toLowerCase();
    return players.filter(
      (p) =>
        (!role || p.role === role) &&
        (!t || [p.name, p.riot_id, p.team_name].some((v) => v && v.toLowerCase().includes(t)))
    );
  }, [players, text, role]);

  return (
    <>
      <div className="toolbar">
        <input className="input" placeholder="Buscar jugador, Riot ID o equipo…" value={text} onChange={(e) => setText(e.target.value)} />
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Todos los roles</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      {list.length === 0 ? (
        <div className="empty">No hay jugadores que coincidan.</div>
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Jugador</th><th>Equipo</th><th className="hide-sm">Rol</th><th className="hide-sm">Rango</th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="click">
                  <td>
                    <Link href={`/jugadores/${encodeURIComponent(p.id)}`} className="player-cell">
                      <Avatar src={p.avatar} name={p.name} />
                      <span>{p.name}<div className="riot">{p.riot_id ?? 'Sin Riot ID'}</div></span>
                    </Link>
                  </td>
                  <td>
                    {p.team_id ? (
                      <Link href={`/equipos/${p.team_id}`}><span className="tag violet" style={{ marginRight: 8 }}>{p.team_tag}</span><span className="hide-sm">{p.team_name}</span></Link>
                    ) : <span className="muted">Agente libre</span>}
                  </td>
                  <td className="hide-sm">{p.role ?? <span className="muted">—</span>}</td>
                  <td className="hide-sm">{p.rank ?? <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
