import fs from "node:fs";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  console.error("DATABASE_URL_UNPOOLED is required to apply the schema.");
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 1 });
const sql = fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

try {
  await pool.query(sql);
  console.log("Applied db/schema.sql");
} finally {
  await pool.end();
}
