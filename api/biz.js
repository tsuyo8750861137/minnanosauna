import { sql } from '@vercel/postgres';

const DEFAULT_BIZ = {
  enabled: false,
  openDays: [1, 2, 3, 4, 5, 6, 0],
  startHour: 10,
  endHour: 22,
  slotDuration: 2,
  closedDates: [],
};

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS biz_hours (
      id INTEGER PRIMARY KEY DEFAULT 1,
      settings JSONB NOT NULL
    )
  `;
}

export default async function handler(req, res) {
  try {
    await init();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT settings FROM biz_hours WHERE id = 1`;
      return res.json(rows[0] ? rows[0].settings : DEFAULT_BIZ);
    }

    if (req.method === 'POST') {
      const settings = req.body;
      await sql`
        INSERT INTO biz_hours (id, settings) VALUES (1, ${JSON.stringify(settings)})
        ON CONFLICT (id) DO UPDATE SET settings = ${JSON.stringify(settings)}
      `;
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
