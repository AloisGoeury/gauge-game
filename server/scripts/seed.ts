import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL est requis pour lancer le seed.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const themes = [
  ["Un plat", "nul", "excellent"],
  ["Un objet", "très court", "très long"],
  ["Une activité", "reposante", "épuisante"],
  ["Un film", "oubliable", "chef-d'oeuvre"],
  ["Un animal", "minuscule", "immense"],
  ["Une destination", "ennuyeuse", "inoubliable"]
];

try {
  for (const [title, left, right] of themes) {
    await pool.query(
      `insert into themes (title, left_label, right_label, is_public, is_approved)
       values ($1, $2, $3, true, true)
       on conflict do nothing`,
      [title, left, right]
    );
  }
  console.log(`Seeded ${themes.length} approved public themes`);
} finally {
  await pool.end();
}
