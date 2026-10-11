import type { Q } from './db';

// Formato: eliminación directa. Semifinales y final al mejor de 3.
// El partido por el 3er lugar se juega entre los perdedores de semis.
export const BO_EARLY = 1; // rondas antes de semis
export const BO_SEMIS = 3;
export const BO_FINAL = 3;
export const BO_THIRD = 3; // partido por el 3er lugar (cámbialo a 1 si prefieren)

/** Orden estándar de cabezas de serie: 1 vs último, 2 vs penúltimo, etc. */
export function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const n = order.length * 2;
    order = order.flatMap((s) => [s, n + 1 - s]);
  }
  return order;
}

export function roundName(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinales';
  if (fromEnd === 2) return 'Cuartos de final';
  if (fromEnd === 3) return 'Octavos de final';
  return `Ronda de ${2 ** (fromEnd + 1)}`;
}

/** Crea el cuadro completo a partir de una lista de equipos ya ordenada por siembra. */
export async function generateBracket(q: Q, teamIds: number[]) {
  await q('delete from matches');
  if (teamIds.length < 2) return;
  let size = 2;
  while (size < teamIds.length) size *= 2;
  const rounds = Math.log2(size);
  const order = seedOrder(size);

  for (let r = 1; r <= rounds; r++) {
    const count = size / 2 ** r;
    const bo = count === 1 ? BO_FINAL : count === 2 ? BO_SEMIS : BO_EARLY;
    for (let s = 0; s < count; s++) {
      let t1: number | null = null;
      let t2: number | null = null;
      if (r === 1) {
        t1 = teamIds[order[2 * s] - 1] ?? null;
        t2 = teamIds[order[2 * s + 1] - 1] ?? null;
      }
      await q(
        'insert into matches (round, slot, team1_id, team2_id, best_of) values ($1,$2,$3,$4,$5)',
        [r, s, t1, t2, bo]
      );
    }
  }
  if (rounds >= 2) {
    await q(
      'insert into matches (round, slot, best_of, third_place) values ($1, 1, $2, true)',
      [rounds, BO_THIRD]
    );
  }
  await recomputeBracket(q);
}

function decide(m: any): number | null {
  if (m.team1_id == null || m.team2_id == null) return null;
  if (m.score1 == null || m.score2 == null) return null;
  const need = Math.ceil(m.best_of / 2);
  if (m.score1 >= need && m.score1 > m.score2) return m.team1_id;
  if (m.score2 >= need && m.score2 > m.score1) return m.team2_id;
  return null;
}

/**
 * Recalcula quién avanza en todo el cuadro. Si se corrige un resultado y cambia
 * el ganador, los partidos siguientes que dependían de él se limpian.
 */
export async function recomputeBracket(q: Q) {
  const all = await q('select * from matches order by round, third_place, slot');
  if (!all.length) return;
  const rounds = Math.max(...all.map((m) => m.round));
  const key = (r: number, s: number) => `${r}-${s}`;
  const main = new Map<string, any>();
  for (const m of all) if (!m.third_place) main.set(key(m.round, m.slot), m);
  const changed = new Set<any>();

  const set = (m: any, field: string, value: any) => {
    if ((m[field] ?? null) !== (value ?? null)) {
      m[field] = value ?? null;
      changed.add(m);
    }
  };
  const feed = (m: any, t1: number | null, t2: number | null) => {
    if ((m.team1_id ?? null) !== t1 || (m.team2_id ?? null) !== t2) {
      set(m, 'team1_id', t1);
      set(m, 'team2_id', t2);
      set(m, 'score1', null);
      set(m, 'score2', null);
    }
  };

  for (let r = 1; r <= rounds; r++) {
    const count = 2 ** (rounds - r);
    for (let s = 0; s < count; s++) {
      const m = main.get(key(r, s));
      if (!m) continue;
      if (r > 1) {
        const a = main.get(key(r - 1, 2 * s));
        const b = main.get(key(r - 1, 2 * s + 1));
        feed(m, a?.winner_id ?? null, b?.winner_id ?? null);
      }
      let w = decide(m);
      if (r === 1 && w == null) {
        // "Bye": si en primera ronda falta un rival, el otro avanza directo.
        if (m.team1_id != null && m.team2_id == null) w = m.team1_id;
        if (m.team2_id != null && m.team1_id == null) w = m.team2_id;
      }
      set(m, 'winner_id', w);
    }
  }

  const third = all.find((m) => m.third_place);
  if (third && rounds >= 2) {
    const loser = (m: any) =>
      m && m.winner_id != null && m.team1_id != null && m.team2_id != null
        ? m.winner_id === m.team1_id
          ? m.team2_id
          : m.team1_id
        : null;
    feed(third, loser(main.get(key(rounds - 1, 0))), loser(main.get(key(rounds - 1, 1))));
    set(third, 'winner_id', decide(third));
  }

  for (const m of changed) {
    await q(
      'update matches set team1_id=$2, team2_id=$3, score1=$4, score2=$5, winner_id=$6 where id=$1',
      [m.id, m.team1_id, m.team2_id, m.score1, m.score2, m.winner_id]
    );
  }
}
