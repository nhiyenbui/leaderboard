export default async function handler(req, res) {
  try {
    const SHEET_ID = process.env.SHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

    if (!SHEET_ID) {
      return res.status(500).json({ error: "Missing SHEET_ID in Vercel Environment Variables" });
    }

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      SHEET_NAME
    )}`;

    const r = await fetch(url);
    if (!r.ok) {
      const body = await r.text();
      return res.status(500).json({
        error: `Google returned ${r.status}`,
        details: body.slice(0, 300),
      });
    }

    let csv = await r.text();

    // ✅ Normalize the CSV so each row is on a new line
    csv = csv
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // turns:  "Prompts" "2026-..."  into:
      //         "Prompts"\n"2026-..."
      .replace(/"\s+"/g, "\"\n\"");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
}
