export default async function handler(req, res) {
  try {
    const SHEET_ID = process.env.SHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

    if (!SHEET_ID) {
      return res.status(500).json({
        error: "Missing SHEET_ID environment variable",
      });
    }

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      SHEET_NAME
    )}`;

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      return res.status(500).json({
        error: `Google returned ${response.status}`,
        details: body.slice(0, 300),
      });
    }

    let csv = await response.text();

    // 🔧 FIX: normalize CSV so each row is on its own line
    csv = csv
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/"\s+"/g, "\"\n\"");

    // 🚫 Disable all caching so Vercel never serves old content
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Unknown server error",
    });
  }
}
