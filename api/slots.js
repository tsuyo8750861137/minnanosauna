import { sql } from '@vercel/postgres';

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      start_hour INTEGER NOT NULL,
      end_hour INTEGER NOT NULL
    )
  `;
}

export default async function handler(req, res) {
  try {
    await init();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM slots ORDER BY date, start_hour`;
      return res.json(rows.map(r => ({
        id: r.id,
        date: r.date,
        startHour: r.start_hour,
        endHour: r.end_hour,
      })));
    }

    if (req.method === 'POST') {
      const { id, date, startHour, endHour } = req.body;
      await sql`INSERT INTO slots (id, date, start_hour, end_hour) VALUES (${id}, ${date}, ${startHour}, ${endHour})`;
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM slots WHERE id = ${id}`;
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
