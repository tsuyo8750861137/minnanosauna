import { sql } from '@vercel/postgres';

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      slot_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_hour INTEGER NOT NULL,
      end_hour INTEGER NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      people TEXT NOT NULL,
      has_sticker BOOLEAN NOT NULL DEFAULT false,
      rentals JSONB DEFAULT '{}',
      rental_total INTEGER DEFAULT 0,
      price INTEGER NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export default async function handler(req, res) {
  try {
    await init();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM reservations ORDER BY created_at DESC`;
      return res.json(rows.map(r => ({
        id: r.id,
        slotId: r.slot_id,
        date: r.date,
        startHour: r.start_hour,
        endHour: r.end_hour,
        name: r.name,
        contact: r.contact,
        people: r.people,
        hasSticker: r.has_sticker,
        rentals: r.rentals,
        rentalTotal: r.rental_total,
        price: r.price,
        notes: r.notes,
        status: r.status,
        createdAt: r.created_at,
      })));
    }

    if (req.method === 'POST') {
      const r = req.body;
      await sql`
        INSERT INTO reservations
          (id, slot_id, date, start_hour, end_hour, name, contact, people, has_sticker, rentals, rental_total, price, notes, status)
        VALUES
          (${r.id}, ${r.slotId}, ${r.date}, ${r.startHour}, ${r.endHour},
           ${r.name}, ${r.contact}, ${r.people}, ${r.hasSticker},
           ${JSON.stringify(r.rentals)}, ${r.rentalTotal}, ${r.price}, ${r.notes || ''}, 'pending')
      `;
      return res.json({ ok: true });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body;
      await sql`UPDATE reservations SET status = ${status} WHERE id = ${id}`;
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
