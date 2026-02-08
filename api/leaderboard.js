export default async function handler(req, res) {
  try {
    const SHEET_ID = process.env.SHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

    // no caching (prevents old data/errors sticking)
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (!SHEET_ID) {
      return res.status(500).json({
        error: "Missing SHEET_ID in Vercel Environment Variables",
        hint: "Vercel → Project → Settings → Environment Variables → add SHEET_ID for BOTH Production + Preview",
      });
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      SHEET_NAME
    )}`;

    const r = await fetch(sheetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const text = await r.text();

    if (!r.ok) {
      return res.status(500).json({
        error: "Google Sheet fetch failed",
        status: r.status,
        hint:
          "Check: (1) Sheet is shared: Anyone with the link → Viewer, (2) SHEET_NAME matches the tab name exactly",
        google_response_preview: text.slice(0, 300),
      });
    }

    // Fix one-line CSV (quotes separated by spaces)
    const csv = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/"\s+"/g, "\"\n\"");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    return res.status(200).send(csv);
  } catch (e) {
    return res.status(500).json({
      error: "Server function crashed",
      message: String(e?.message || e),
    });
  }
}
