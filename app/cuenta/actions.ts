'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { q } from '@/lib/db';
import { getSettings, getUser, MAX_ROSTER, normalizeRegCode, randomCode, RANKS, ROLES, removeFromTeam } from '@/lib/data';

function back(kind: 'ok' | 'err', msg: string): never {
  revalidatePath('/', 'layout');
  redirect(`/cuenta?${kind}=${encodeURIComponent(msg)}`);
}
async function me() {
  const u = await getCurrentUser();
  if (!u) redirect('/ingresar');
  const row = await getUser(u.id);
  if (!row) redirect('/ingresar');
  return row;
}
async function bracketLocked() {
  const [{ n }] = await q('select count(*)::int as n from matches');
  return n > 0;
}

export async function updateProfile(fd: FormData) {
  const u = await me();
  const riot = String(fd.get('riot_id') ?? '').trim();
  const rank = String(fd.get('rank') ?? '');
  const role = String(fd.get('role') ?? '');
  if (riot && !/^.{3,16}#[A-Za-z0-9]{2,5}$/.test(riot)) back('err', 'El Riot ID debe tener el formato Nombre#TAG.');
  await q('update users set riot_id=$2, rank=$3, role=$4 where id=$1', [
    u.id, riot || null, RANKS.includes(rank) ? rank : null, ROLES.includes(role) ? role : null,
  ]);
  back('ok', 'Perfil guardado.');
}

export async function createTeam(fd: FormData) {
  const u = await me();
  const s = await getSettings();
  if (!s.registration_open || (await bracketLocked())) back('err', 'Las inscripciones están cerradas.');
  if (u.team_id) back('err', 'Ya perteneces a un equipo.');
  if (!u.riot_id) back('err', 'Primero agrega tu Riot ID en tu perfil.');
  const regCode = normalizeRegCode(String(fd.get('reg_code') ?? ''));
  if (!regCode) back('err', 'Necesitas un código de inscripción. Se entrega al pagar la inscripción.');
  const [rc] = await q('select * from reg_codes where code=$1', [regCode]);
  if (!rc) back('err', 'Ese código de inscripción no existe. Revisa que esté bien escrito.');
  if (rc.team_id) back('err', 'Ese código de inscripción ya fue usado por otro equipo.');
  const name = String(fd.get('name') ?? '').trim().replace(/\s+/g, ' ');
  const tag = String(fd.get('tag') ?? '').trim().toUpperCase();
  if (name.length < 3 || name.length > 30) back('err', 'El nombre del equipo debe tener entre 3 y 30 caracteres.');
  if (!/^[A-Z0-9]{2,5}$/.test(tag)) back('err', 'El tag debe tener de 2 a 5 letras o números.');
  const dup = await q('select 1 from teams where lower(name)=lower($1)', [name]);
  if (dup.length) back('err', 'Ya existe un equipo con ese nombre.');
  const [t] = await q(
    'insert into teams (name, tag, captain_id, invite_code) values ($1,$2,$3,$4) returning id',
    [name, tag, u.id, randomCode()]
  );
  // Marca el código como usado (solo si nadie lo usó en el mismo instante).
  const used = await q('update reg_codes set team_id=$2, used_at=now() where code=$1 and team_id is null returning code', [regCode, t.id]);
  if (!used.length) {
    await q('delete from teams where id=$1', [t.id]);
    back('err', 'Ese código de inscripción ya fue usado por otro equipo.');
  }
  await q('update users set team_id=$2 where id=$1', [u.id, t.id]);
  back('ok', `Equipo "${name}" creado. Comparte el código del equipo con tus compañeros.`);
}

export async function joinTeam(fd: FormData) {
  const u = await me();
  const s = await getSettings();
  if (!s.registration_open || (await bracketLocked())) back('err', 'Las inscripciones están cerradas.');
  if (u.team_id) back('err', 'Ya perteneces a un equipo.');
  if (!u.riot_id) back('err', 'Primero agrega tu Riot ID en tu perfil.');
  const code = String(fd.get('code') ?? '').trim().toUpperCase();
  const [t] = await q('select * from teams where invite_code=$1', [code]);
  if (!t) back('err', 'Código no válido. Revisa que esté bien escrito.');
  // Actualización condicional: solo entra si aún hay cupo.
  const res = await q(
    `update users set team_id=$2 where id=$1 and team_id is null
       and (select count(*) from users where team_id=$2) < $3 returning id`,
    [u.id, t.id, MAX_ROSTER]
  );
  if (!res.length) back('err', `El equipo ya tiene el máximo de ${MAX_ROSTER} jugadores.`);
  back('ok', `Te uniste a ${t.name}.`);
}

export async function leaveTeam() {
  const u = await me();
  if (!u.team_id) back('err', 'No perteneces a ningún equipo.');
  if (await bracketLocked()) back('err', 'El cuadro ya está publicado. Pide a la organización cualquier cambio.');
  await removeFromTeam(u.id);
  back('ok', 'Saliste del equipo.');
}

export async function kickMember(fd: FormData) {
  const u = await me();
  const target = String(fd.get('user_id') ?? '');
  const [t] = await q('select * from teams where id=$1', [u.team_id]);
  if (!t || t.captain_id !== u.id) back('err', 'Solo el capitán puede quitar jugadores.');
  if (await bracketLocked()) back('err', 'El cuadro ya está publicado. Pide a la organización cualquier cambio.');
  if (target === u.id) back('err', 'Para salir tú, usa "Salir del equipo".');
  await q('update users set team_id=null where id=$1 and team_id=$2', [target, t.id]);
  back('ok', 'Jugador quitado del equipo.');
}

export async function newInviteCode() {
  const u = await me();
  const [t] = await q('select * from teams where id=$1', [u.team_id]);
  if (!t || t.captain_id !== u.id) back('err', 'Solo el capitán puede cambiar el código.');
  await q('update teams set invite_code=$2 where id=$1', [t.id, randomCode()]);
  back('ok', 'Código nuevo generado. El anterior ya no sirve.');
}
