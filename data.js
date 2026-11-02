// Shared helpers used by the calendar, news, links and ideas pages.
// Each page asks for one CSV file from the "data" folder and gets its rows back.

function pad(n) { return String(n).padStart(2, "0"); }

// Reads CSV text into rows of fields (handles quoted fields and commas inside quotes)
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/)[0] || "";
  const delim = (firstLine.indexOf(";") !== -1 && firstLine.indexOf(",") === -1) ? ";" : ",";

  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Accepts 2026-11-05 or 11/5/2026 and returns "2026-11-05" (or null)
function toKey(text) {
  const t = (text || "").trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return m[1] + "-" + pad(m[2]) + "-" + pad(m[3]);
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + "-" + pad(m[1]) + "-" + pad(m[2]);
  return null;
}

// Turns "2026-11-05" into a Date at local midnight
function keyToDate(key) {
  const p = key.split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

// Loads data/<file> and returns a list of rows, each an object keyed by the
// column headers in lowercase, e.g. { date: "2026-11-05", title: "Math midterm" }
function loadSheet(file) {
  return fetch("data/" + file, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("Could not load " + file);
      return r.text();
    })
    .then(function (text) {
      const rows = parseCSV(text);
      if (rows.length === 0) return [];
      const headers = rows[0].map(function (h) { return h.trim().toLowerCase(); });
      return rows.slice(1).filter(function (r) {
        return r.some(function (c) { return c.trim() !== ""; });
      }).map(function (r) {
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = (r[i] || "").trim(); });
        return obj;
      });
    });
}
