import { q } from './db';

export const MAX_ROSTER = 7; // 5 titulares + 2 suplentes
export const MIN_ROSTER = 5;

export const RANKS = [
  'Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Ascendente', 'Inmortal', 'Radiante',
];
export const ROLES = ['Duelista', 'Iniciador', 'Controlador', 'Centinela', 'Flex'];

export type User = {
  id: string;
  name: string;
  avatar: string | null;
  riot_id: string | null;
  rank: string | null;
  role: string | null;
  team_id: number | null;
};
export type Team = {
  id: number;
  name: string;
  tag: string;
  captain_id: string;
  invite_code: string;
  members: User[];
};
export type Match = {
  id: number;
  round: number;
  slot: number;
  team1_id: number | null;
  team2_id: number | null;
  score1: number | null;
  score2: number | null;
  best_of: number;
  winner_id: number | null;
  third_place: boolean;
  scheduled_at: string | null;
  maps: string | null;
};

// ---------- Usuarios ----------
export async function upsertUser(id: string, name: string, avatar: string | null) {
  await q(
    `insert into users (id, name, avatar) values ($1,$2,$3)
     on conflict (id) do update set name = excluded.name, avatar = excluded.avatar`,
    [id, name, avatar]
  );
}
export async function getUser(id: string): Promise<User | null> {
  const rows = await q('select * from users where id=$1', [id]);
  return rows[0] ?? null;
}
export async function getPlayers(): Promise<(User & { team_name: string | null; team_tag: string | null })[]> {
  return q(
    `select u.*, t.name as team_name, t.tag as team_tag
     from users u left join teams t on t.id = u.team_id
     where u.team_id is not null or u.riot_id is not null
     order by lower(u.name)`
  );
}

// ---------- Equipos ----------
export async function getTeams(): Promise<Team[]> {
  const [teams, members] = await Promise.all([
    q('select * from teams order by created_at, id'),
    q('select * from users where team_id is not null order by created_at'),
  ]);
  return teams.map((t) => ({ ...t, members: members.filter((m) => m.team_id === t.id) }));
}
export async function getTeam(id: number): Promise<Team | null> {
  const rows = await q('select * from teams where id=$1', [id]);
  if (!rows[0]) return null;
  const members = await q('select * from users where team_id=$1 order by created_at', [id]);
  return { ...rows[0], members };
}

// ---------- Partidos ----------
export async function getMatches(): Promise<Match[]> {
  return q('select * from matches order by round, third_place, slot');
}

// ---------- Ajustes ----------
export type Settings = {
  registration_open: boolean;
  stream_channel: string;
  discord_invite: string;
  instagram: string;
  facebook: string;
  x: string;
  tiktok: string;
  whatsapp: string;
};
export async function getSettings(): Promise<Settings> {
  const rows = await q('select key, value from settings');
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']));
  return {
    registration_open: (m.registration_open ?? '1') === '1',
    stream_channel: m.stream_channel ?? '',
    discord_invite: m.discord_invite ?? '',
    instagram: m.instagram ?? '',
    facebook: m.facebook ?? '',
    x: m.x ?? '',
    tiktok: m.tiktok ?? '',
    whatsapp: m.whatsapp ?? '',
  };
}
export async function setSetting(key: string, value: string) {
  await q(
    'insert into settings (key, value) values ($1,$2) on conflict (key) do update set value = excluded.value',
    [key, value]
  );
}

const WA_TEXT = 'Hola! Quiero inscribir a mi equipo en el Torneo 5vs5 UdeC 2026';
/** Número como "+56 9 1234 5678" -> enlace de WhatsApp con mensaje listo. */
export function whatsappLink(num: string) {
  let d = (num || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.length === 9 && d.startsWith('9')) d = '56' + d; // celular chileno sin +56
  return `https://wa.me/${d}?text=${encodeURIComponent(WA_TEXT)}`;
}

export function randomCode(len = 6) {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

/** "2026-10-20T19:30" -> "mar 20 oct · 19:30" (sin conversiones de zona horaria). */
export function formatWhen(v: string | null) {
  if (!v) return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return v;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const date = `${days[d.getUTCDay()]} ${+m[3]} ${months[+m[2] - 1]}`;
  return m[4] ? `${date} · ${m[4]}:${m[5]}` : date;
}

/**
 * Saca a un jugador de su equipo. Si era capitán, la capitanía pasa al jugador
 * más antiguo; si el equipo queda vacío y no está en el cuadro, se elimina.
 */
export async function removeFromTeam(userId: string) {
  const [u] = await q('select team_id from users where id=$1', [userId]);
  if (!u?.team_id) return;
  const [t] = await q('select * from teams where id=$1', [u.team_id]);
  await q('update users set team_id=null where id=$1', [userId]);
  if (!t) return;
  const [next] = await q('select id from users where team_id=$1 order by created_at limit 1', [t.id]);
  if (next) {
    if (t.captain_id === userId) await q('update teams set captain_id=$2 where id=$1', [t.id, next.id]);
  } else {
    const [{ n }] = await q('select count(*)::int as n from matches where team1_id=$1 or team2_id=$1', [t.id]);
    if (n === 0) await q('delete from teams where id=$1', [t.id]);
  }
}

export async function getAllUsers(): Promise<(User & { team_name: string | null; team_tag: string | null; is_captain: boolean })[]> {
  return q(
    `select u.*, t.name as team_name, t.tag as team_tag, (t.captain_id = u.id) as is_captain
     from users u left join teams t on t.id = u.team_id
     order by t.name nulls last, lower(u.name)`
  );
}

// ---------- Códigos de inscripción (se entregan a quien pagó) ----------
export type RegCode = { code: string; note: string | null; team_id: number | null; team_name: string | null; created_at: string; used_at: string | null };

export function newRegCode() {
  return `${randomCode(4)}-${randomCode(4)}`;
}
export function normalizeRegCode(v: string) {
  const c = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
}
export async function getRegCodes(): Promise<RegCode[]> {
  return q(
    `select c.*, t.name as team_name from reg_codes c left join teams t on t.id = c.team_id
     order by (c.team_id is not null), c.created_at desc`
  );
}
