const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const shortid = require("shortid");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

// SQLite database
const db = new sqlite3.Database("./urls.db", (err) => {
  if (err) console.error(err);
  else console.log("SQLite connected");
});

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    short_code TEXT NOT NULL
  )
`);

// Root
app.get("/", (req, res) => {
  res.send("API is working");
});

// URL Shortener
app.post("/api/shorten", (req, res) => {
  const url = req.body?.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Check if URL already exists
  db.get(
    "SELECT short_code FROM urls WHERE original_url = ?",
    [url],
    (err, row) => {
      if (row) {
        return res.json({
          shortUrl: `http://localhost:5000/${row.short_code}`,
          existing: true,
        });
      }

      const code = shortid.generate();

      db.run(
        "INSERT INTO urls (original_url, short_code) VALUES (?, ?)",
        [url, code],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "DB error" });
          }

          res.json({
            shortUrl: `http://localhost:5000/${code}`,
            existing: false,
          });
        }
      );
    }
  );
});

// Redirect
app.get("/:code", (req, res) => {
  const { code } = req.params;

  db.get(
    "SELECT original_url FROM urls WHERE short_code = ?",
    [code],
    (err, row) => {
      if (!row) {
        return res.status(404).send("URL not found");
      }
      res.redirect(row.original_url);
    }
  );
});

// QR Code Generator (separate feature)
app.post("/api/qrcode", async (req, res) => {
  const data = req.body?.data;

  if (!data) {
    return res.status(400).json({ error: "Data is required" });
  }

  try {
    const qr = await QRCode.toDataURL(data);
    res.json({ qrCode: qr });
  } catch (err) {
    res.status(500).json({ error: "QR generation failed" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
