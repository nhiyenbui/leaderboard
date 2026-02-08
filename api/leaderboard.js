export default async function handler(req, res) {
  try {
    const SHEET_ID = process.env.SHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch sheet');

    const csv = await response.text();

    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load leaderboard data' });
  }
}
