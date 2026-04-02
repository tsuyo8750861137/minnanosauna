export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password } = req.body;
  const correct = process.env.ADMIN_PASSWORD || 'sauna2024';
  if (password === correct) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false });
}
