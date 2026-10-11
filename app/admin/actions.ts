'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { q } from '@/lib/db';
import { generateBracket, recomputeBracket } from '@/lib/bracket';
import { getTeams, MIN_ROSTER, removeFromTeam, setSetting } from '@/lib/data';

function back(kind: 'ok' | 'err', msg: string, hash = ''): never {
  revalidatePath('/', 'layout');
  redirect(`/admin?${kind}=${encodeURIComponent(msg)}${hash}`);
}
async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u?.isAdmin) redirect('/');
}

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  await setSetting('registration_open', fd.get('registration_open') ? '1' : '0');
  for (const k of ['stream_channel', 'discord_invite', 'instagram', 'facebook', 'x', 'tiktok', 'whatsapp']) {
    await setSetting(k, String(fd.get(k) ?? '').trim());
  }
  back('ok', 'Ajustes guardados.');
}

export async function createBracket(fd: FormData) {
  await requireAdmin();
  const onlyFull = !!fd.get('only_full');
  const mode = String(fd.get('mode') ?? 'random');
  let teams = await getTeams();
  if (onlyFull) teams = teams.filter((t) => t.members.length >= MIN_ROSTER);
  if (teams.length < 2) back('err', 'Se necesitan al menos 2 equipos para armar el cuadro.');
  let ids = teams.map((t) => t.id);
  if (mode === 'random') {
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
  }
  await generateBracket(q, ids);
  await setSetting('registration_open', '0');
  back('ok', `Cuadro creado con ${ids.length} equipos. Las inscripciones quedaron cerradas.`);
}

export async function deleteBracket() {
  await requireAdmin();
  await q('delete from matches');
  back('ok', 'Cuadro eliminado.');
}

export async function saveMatch(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const num = (k: string) => {
    const v = String(fd.get(k) ?? '').trim();
    return v === '' ? null : Math.max(0, Math.min(3, Math.floor(Number(v)) || 0));
  };
  const [m] = await q('select * from matches where id=$1', [id]);
  if (!m) back('err', 'Partido no encontrado.');
  let s1 = num('score1');
  let s2 = num('score2');
  if ((s1 == null) !== (s2 == null)) back('err', 'Ingresa ambos marcadores (o deja ambos vacíos).', '#partidos');
  if (s1 != null) {
    const need = Math.ceil(m.best_of / 2);
    if (s1 === s2 || Math.max(s1, s2) !== need) {
      back('err', `En un BO${m.best_of} el ganador debe llegar a ${need} (ej: ${need}-0${need > 1 ? ` o ${need}-1` : ''}).`, '#partidos');
    }
  }
  const when = String(fd.get('scheduled_at') ?? '').trim() || null;
  await q('update matches set score1=$2, score2=$3, scheduled_at=$4 where id=$1', [id, s1, s2, when]);
  await recomputeBracket(q);
  back('ok', 'Partido actualizado.', '#partidos');
}

export async function deleteTeam(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('team_id'));
  const [{ n }] = await q('select count(*)::int as n from matches where team1_id=$1 or team2_id=$1', [id]);
  if (n > 0) back('err', 'Ese equipo ya está en el cuadro. Elimina el cuadro primero.', '#equipos');
  await q('update users set team_id=null where team_id=$1', [id]);
  await q('delete from teams where id=$1', [id]);
  back('ok', 'Equipo eliminado.', '#equipos');
}

export async function adminRemoveFromTeam(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get('user_id') ?? '');
  await removeFromTeam(id);
  back('ok', 'Jugador quitado de su equipo.', '#jugadores');
}

/** Borra el perfil del jugador. Puede volver a entrar con Discord cuando quiera. */
export async function adminDeletePlayer(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get('user_id') ?? '');
  await removeFromTeam(id);
  await q('delete from users where id=$1', [id]);
  back('ok', 'Jugador eliminado. Si vuelve a entrar con Discord, empieza con un perfil nuevo.', '#jugadores');
}
