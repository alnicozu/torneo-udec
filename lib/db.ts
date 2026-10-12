// Conexión a la base de datos.
// - Con DATABASE_URL (Neon / Vercel Postgres): usa la base real.
// - Sin DATABASE_URL: "modo demo" con una base en memoria y datos de ejemplo,
//   útil para ver la página antes de configurar nada.

export type Q = (text: string, params?: unknown[]) => Promise<any[]>;

// Acepta el nombre de variable que haya creado Vercel/Neon.
const DB_URL =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || '';
export const isDemo = !DB_URL;

const SCHEMA = [
  `create table if not exists users (
    id text primary key,
    name text not null,
    avatar text,
    riot_id text,
    rank text,
    role text,
    team_id int,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists teams (
    id serial primary key,
    name text not null unique,
    tag text not null,
    captain_id text not null,
    invite_code text not null unique,
    created_at timestamptz not null default now()
  )`,
  `alter table teams add column if not exists logo text`,
  `alter table teams add column if not exists logo_v int not null default 0`,
  `create table if not exists matches (
    id serial primary key,
    round int not null,
    slot int not null,
    team1_id int,
    team2_id int,
    score1 int,
    score2 int,
    best_of int not null default 1,
    winner_id int,
    third_place boolean not null default false,
    scheduled_at text,
    maps text
  )`,
  `create table if not exists reg_codes (
    code text primary key,
    note text,
    team_id int,
    created_at timestamptz not null default now(),
    used_at timestamptz
  )`,
  `create table if not exists settings (
    key text primary key,
    value text
  )`,
];

const g = globalThis as any;

async function init(): Promise<Q> {
  let q: Q;
  if (!isDemo) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(DB_URL);
    q = (text, params = []) => (sql as any)(text, params) as Promise<any[]>;
    for (const s of SCHEMA) await q(s);
    return q;
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  q = async (text, params = []) => (await db.query(text, params as any[])).rows as any[];
  for (const s of SCHEMA) await q(s);
  const { seedDemo } = await import('./seed');
  await seedDemo(q);
  return q;
}

export async function q(text: string, params: unknown[] = []): Promise<any[]> {
  if (!g.__torneoDb) {
    g.__torneoDb = init().catch((e) => {
      g.__torneoDb = null;
      throw e;
    });
  }
  const run: Q = await g.__torneoDb;
  return run(text, params);
}
