import type { Q } from './db';
import { generateBracket, recomputeBracket } from './bracket';

// Datos de ejemplo SOLO para el modo demo (cuando no hay base de datos conectada).
const TEAMS = [
  ['Penquistas Rush', 'PQR'],
  ['Bío Bío Aces', 'BBA'],
  ['Campanil Esports', 'CMP'],
  ['Los Copihues', 'CPH'],
  ['Laguna Grande', 'LGR'],
  ['Talcahuano Five', 'TH5'],
  ['Diagonal Gaming', 'DGM'],
  ['Pedro de Valdivia', 'PDV'],
];
const NAMES = [
  'nico', 'fran', 'seba', 'cata', 'benja', 'vale', 'tomi', 'javi', 'mati', 'coni', 'ignacio', 'dani',
  'pipe', 'rocio', 'joaco', 'flor', 'max', 'antonia', 'gabo', 'emi', 'lucas', 'isi', 'vicho', 'trini',
  'diego', 'sofi', 'cristobal', 'maite', 'agus', 'pancho', 'josefa', 'bruno', 'ale', 'renata', 'kevin',
  'fer', 'leo', 'amanda', 'santi', 'paz', 'nacho', 'martina',
];
const RANKS = ['Plata', 'Oro', 'Platino', 'Diamante', 'Ascendente', 'Inmortal'];
const ROLES = ['Duelista', 'Iniciador', 'Controlador', 'Centinela', 'Flex'];

export async function seedDemo(q: Q) {
  const ids: number[] = [];
  let n = 0;
  for (let i = 0; i < TEAMS.length; i++) {
    const [name, tag] = TEAMS[i];
    const size = i % 3 === 0 ? 6 : 5;
    const captain = `demo-${n}`;
    const [t] = await q(
      'insert into teams (name, tag, captain_id, invite_code) values ($1,$2,$3,$4) returning id',
      [name, tag, captain, `DEMO${i}${tag}`]
    );
    ids.push(t.id);
    for (let k = 0; k < size; k++, n++) {
      const nick = NAMES[n % NAMES.length];
      await q(
        `insert into users (id, name, riot_id, rank, role, team_id, created_at)
         values ($1,$2,$3,$4,$5,$6, now() + ($7 || ' seconds')::interval)`,
        [`demo-${n}`, nick, `${nick}#${1000 + ((n * 37) % 9000)}`, RANKS[(n * 7 + i) % RANKS.length],
          ROLES[k % ROLES.length], t.id, String(n)]
      );
    }
  }
  await q("insert into users (id, name) values ('demo-player', 'Jugador Demo'), ('demo-admin', 'Admin Demo')");
  await q("insert into settings (key, value) values ('registration_open','0'), ('stream_channel',''), ('instagram',''), ('facebook',''), ('x',''), ('tiktok',''), ('discord_invite','')");

  await generateBracket(q, ids);

  // Cuartos jugados, una semi jugada, la otra semi y la final por jugar.
  const ms = await q('select * from matches order by round, third_place, slot');
  const set = (r: number, s: number, a: number, b: number, when: string) => {
    const m = ms.find((x) => x.round === r && x.slot === s && !x.third_place);
    return q('update matches set score1=$2, score2=$3, scheduled_at=$4 where id=$1', [m.id, a, b, when]);
  };
  await set(1, 0, 1, 0, '2026-10-17T18:00');
  await set(1, 1, 0, 1, '2026-10-17T19:30');
  await set(1, 2, 1, 0, '2026-10-17T21:00');
  await set(1, 3, 1, 0, '2026-10-18T18:00');
  await recomputeBracket(q);
  const ms2 = await q('select * from matches where round=2 order by slot');
  await q('update matches set score1=2, score2=1, scheduled_at=$2 where id=$1', [ms2[0].id, '2026-10-24T18:00']);
  await q('update matches set scheduled_at=$2 where id=$1', [ms2[1].id, '2026-10-24T20:30']);
  await recomputeBracket(q);
  await q("update matches set scheduled_at='2026-10-31T17:00' where third_place");
  await q("update matches set scheduled_at='2026-10-31T19:30' where round=3 and not third_place");
}
