// Parses CSV text into rows of cells (handles quotes and commas inside quotes)
function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cell += ch; }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell); cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      rows.push(row); row = [];
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// Loads data/<name>.csv and returns a list of objects keyed by the header names.
// Blank rows are skipped. Returns null if the file can't be loaded.
async function loadCSV(name) {
  try {
    const res = await fetch("data/" + name + ".csv?v=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = (await res.text()).replace(/^\uFEFF/, "");
    const rows = parseCSV(text);
    if (rows.length === 0) return [];
    const headers = rows[0].map(function (h) { return h.trim(); });
    return rows.slice(1)
      .filter(function (r) { return r.some(function (c) { return c.trim() !== ""; }); })
      .map(function (r) {
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = (r[i] || "").trim(); });
        return obj;
      });
  } catch (err) {
    console.error("Could not load " + name + ".csv", err);
    return null;
  }
}

// Turns a date into "YYYY-MM-DD"; returns "" if it can't be read
function normalizeDate(s) {
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0");
  const d = new Date(s);
  if (isNaN(d)) return "";
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function prettyDate(iso) {
  const p = iso.split("-");
  return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}