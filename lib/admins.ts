import { dbQuery } from "@/lib/db";

export type Admin = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

type AdminRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

function mapAdmin(row: AdminRow): Admin {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
  };
}

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const rows = await dbQuery<AdminRow>(
    "SELECT id, name, email, password_hash FROM admins WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  return rows[0] ? mapAdmin(rows[0]) : null;
}

export async function listAdmins(): Promise<Array<Pick<Admin, "id" | "name" | "email">>> {
  const rows = await dbQuery<AdminRow>(
    "SELECT id, name, email, password_hash FROM admins ORDER BY id ASC",
  );
  return rows.map((row) => ({ id: Number(row.id), name: row.name, email: row.email }));
}

export async function insertAdmin(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<void> {
  await dbQuery(
    "INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3)",
    [input.name, input.email.trim().toLowerCase(), input.passwordHash],
  );
}

export async function deleteAdmin(id: number): Promise<void> {
  await dbQuery("DELETE FROM admins WHERE id = $1", [id]);
}

export async function countAdmins(): Promise<number> {
  const rows = await dbQuery<{ n: number }>("SELECT COUNT(*)::int AS n FROM admins");
  return Number(rows[0]?.n ?? 0);
}
