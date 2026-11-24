import { dbQuery } from "@/lib/db";
import { isKanda } from "@/lib/places";
import { isRole, type Role } from "@/lib/roles";

export type Admin = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  /** Empty means the admin can see every zone. */
  kanda: string;
};

type AdminRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  kanda?: string;
};

let ready: Promise<void> | null = null;

function ensureAdmins(): Promise<void> {
  ready ??= dbQuery("ALTER TABLE admins ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'admin'")
    .then(() => dbQuery("ALTER TABLE admins ADD COLUMN IF NOT EXISTS kanda text NOT NULL DEFAULT ''"))
    .then(() =>
      dbQuery(
        `UPDATE admins
         SET role = 'super_admin'
         WHERE id = (SELECT MIN(id) FROM admins)
           AND NOT EXISTS (SELECT 1 FROM admins WHERE role = 'super_admin')`,
      ),
    )
    .then(() => undefined)
    .catch((error: unknown) => {
      ready = null;
      throw error;
    });
  return ready;
}

function mapAdmin(row: AdminRow): Admin {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: isRole(row.role) ? row.role : "admin",
    kanda: row.role === "admin" && isKanda(row.kanda ?? "") ? (row.kanda ?? "") : "",
  };
}

const COLUMNS = "id, name, email, password_hash, role, kanda";

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  await ensureAdmins();
  const rows = await dbQuery<AdminRow>(
    `SELECT ${COLUMNS} FROM admins WHERE email = $1`,
    [email.trim().toLowerCase()],
  );
  return rows[0] ? mapAdmin(rows[0]) : null;
}

export async function listAdmins(): Promise<Array<Pick<Admin, "id" | "name" | "email" | "role" | "kanda">>> {
  await ensureAdmins();
  const rows = await dbQuery<AdminRow>(
    `SELECT ${COLUMNS} FROM admins
     ORDER BY CASE role WHEN 'super_admin' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, id ASC`,
  );
  return rows.map((row) => {
    const admin = mapAdmin(row);
    return { id: admin.id, name: admin.name, email: admin.email, role: admin.role, kanda: admin.kanda };
  });
}

export async function insertAdmin(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: Exclude<Role, "super_admin">;
  kanda: string;
}): Promise<void> {
  await ensureAdmins();
  const kanda = input.role === "admin" && isKanda(input.kanda) ? input.kanda : "";
  await dbQuery(
    "INSERT INTO admins (name, email, password_hash, role, kanda) VALUES ($1, $2, $3, $4, $5)",
    [input.name, input.email.trim().toLowerCase(), input.passwordHash, input.role, kanda],
  );
}

export async function setAdminZone(id: number, kanda: string): Promise<void> {
  await ensureAdmins();
  const zone = isKanda(kanda) ? kanda : "";
  await dbQuery("UPDATE admins SET kanda = $2 WHERE id = $1 AND role = 'admin'", [id, zone]);
}

export async function deleteAdmin(id: number): Promise<void> {
  await ensureAdmins();
  await dbQuery("DELETE FROM admins WHERE id = $1 AND role <> 'super_admin'", [id]);
}

export async function countAdmins(): Promise<number> {
  await ensureAdmins();
  const rows = await dbQuery<{ n: number }>("SELECT COUNT(*)::int AS n FROM admins");
  return Number(rows[0]?.n ?? 0);
}
