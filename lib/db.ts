import { attachDatabasePool } from "@vercel/functions";
import { Pool, type QueryResultRow } from "pg";
import type { NewSubmission, Submission } from "./types";

type SqlRow = {
  id: number;
  created_at?: Date | string;
  tarehe: string;
  kanda: string;
  mkoa: string;
  halmashauri: string;
  shughuli: string;
  aina: Submission["aina"];
  eneo?: string;
  mdau?: string;
  hali: Submission["hali"];
  vvu_me: number;
  vvu_ke: number;
  maambukizi_me: number;
  maambukizi_ke: number;
  waliounganishwa: number;
  elimu: number;
  kondomu: number;
  pep: number;
  jipime: number;
  ushahidi?: string;
  sample: boolean;
};

const POOL_VERSION = 4;
const globalForDb = globalThis as unknown as { wadPool?: Pool; wadPoolVersion?: number };

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is missing. Set it in .env.");
  return url;
}

function pool(): Pool {
  if (globalForDb.wadPool && globalForDb.wadPoolVersion === POOL_VERSION) return globalForDb.wadPool;

  const stale = globalForDb.wadPool;
  globalForDb.wadPool = undefined;
  if (stale) void stale.end().catch(() => undefined);

  const nextPool = new Pool({
    connectionString: databaseUrl(),
    max: 3,
    connectionTimeoutMillis: 12_000,
    query_timeout: 12_000,
    idleTimeoutMillis: 120_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    allowExitOnIdle: false,
  });
  nextPool.on("error", () => undefined);
  if (process.env.VERCEL) attachDatabasePool(nextPool);
  globalForDb.wadPool = nextPool;
  globalForDb.wadPoolVersion = POOL_VERSION;
  return nextPool;
}

function resetPool(): void {
  const current = globalForDb.wadPool;
  globalForDb.wadPool = undefined;
  globalForDb.wadPoolVersion = undefined;
  if (current) void current.end().catch(() => undefined);
}

function isTransientConnectionError(error: unknown): boolean {
  if (error instanceof AggregateError) return error.errors.some(isTransientConnectionError);
  const code = (error as { code?: string } | null)?.code;
  if (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EPIPE" ||
    code === "ENOTFOUND" ||
    code === "57P01" ||
    code === "08000" ||
    code === "08003" ||
    code === "08006" ||
    code === "57P05"
  ) {
    return true;
  }
  const message = error instanceof Error ? error.message : "";
  if (/timeout|terminated|socket hang up|Connection ended/i.test(message)) return true;
  const cause = (error as { cause?: unknown } | null)?.cause;
  return Boolean(cause) && cause !== error && isTransientConnectionError(cause);
}

export async function dbQuery<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  try {
    const result = await pool().query<T>(text, values);
    return result.rows;
  } catch (error) {
    if (!isTransientConnectionError(error)) throw error;
    resetPool();
    const result = await pool().query<T>(text, values);
    return result.rows;
  }
}

function asIsoTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function mapRow(row: SqlRow): Submission {
  return {
    id: Number(row.id),
    createdAt: row.created_at ? asIsoTimestamp(row.created_at) : "",
    tarehe: row.tarehe,
    kanda: row.kanda,
    mkoa: row.mkoa,
    halmashauri: row.halmashauri,
    shughuli: row.shughuli,
    aina: row.aina,
    eneo: row.eneo ?? "",
    mdau: row.mdau ?? "",
    hali: row.hali,
    vvuMe: Number(row.vvu_me),
    vvuKe: Number(row.vvu_ke),
    maambukiziMe: Number(row.maambukizi_me),
    maambukiziKe: Number(row.maambukizi_ke),
    waliounganishwa: Number(row.waliounganishwa),
    elimu: Number(row.elimu),
    kondomu: Number(row.kondomu),
    pep: Number(row.pep),
    jipime: Number(row.jipime),
    ushahidi: row.ushahidi ?? "",
    sample: row.sample === true,
  };
}

const SELECT = `
  SELECT id, tarehe, kanda, mkoa, halmashauri, shughuli, aina, hali,
         vvu_me, vvu_ke, maambukizi_me, maambukizi_ke, waliounganishwa,
         elimu, kondomu, pep, jipime, sample
  FROM submissions
`;

export async function listSubmissions(): Promise<Submission[]> {
  const rows = await dbQuery<SqlRow>(`${SELECT} ORDER BY id ASC`);
  return rows.map(mapRow);
}

export async function insertSubmission(entry: NewSubmission): Promise<Submission> {
  const rows = await dbQuery<SqlRow>(
    `INSERT INTO submissions (
      created_at, tarehe, kanda, mkoa, halmashauri, shughuli, aina, eneo, mdau, hali,
      vvu_me, vvu_ke, maambukizi_me, maambukizi_ke, waliounganishwa, elimu, kondomu,
      pep, jipime, ushahidi, sample
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    )
    RETURNING id, created_at, tarehe, kanda, mkoa, halmashauri, shughuli, aina,
              eneo, mdau, hali, vvu_me, vvu_ke, maambukizi_me, maambukizi_ke,
              waliounganishwa, elimu, kondomu, pep, jipime, ushahidi, sample`,
    [
      new Date().toISOString(),
      entry.tarehe,
      entry.kanda,
      entry.mkoa,
      entry.halmashauri,
      entry.shughuli,
      entry.aina,
      entry.eneo,
      entry.mdau,
      entry.hali,
      entry.vvuMe,
      entry.vvuKe,
      entry.maambukiziMe,
      entry.maambukiziKe,
      entry.waliounganishwa,
      entry.elimu,
      entry.kondomu,
      entry.pep,
      entry.jipime,
      entry.ushahidi,
      entry.sample,
    ],
  );
  return mapRow(rows[0]);
}

export async function deleteSamples(): Promise<number> {
  const rows = await dbQuery<{ id: number }>("DELETE FROM submissions WHERE sample = true RETURNING id");
  return rows.length;
}
