const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Strict YYYY-MM-DD check (also rejects things like 2025-02-31)
function isValidDate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === str;
}

// Today's date as YYYY-MM-DD in local time (so comparison is date-only)
function today() {
  const n = new Date();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  return `${n.getFullYear()}-${m}-${d}`;
}

// ACTIVE if today <= expiry_date, EXPIRED otherwise.
// ISO date strings compare correctly as plain strings.
function withStatus(item) {
  return { ...item, status: today() <= item.expiry_date ? 'ACTIVE' : 'EXPIRED' };
}

// ---------- routes ----------

// GET all
app.get('/api/announcements', (req, res) => {
  const data = readData();
  res.status(200).json(data.map(withStatus));
});

// GET one by ID
app.get('/api/announcements/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = readData().find((a) => a.id === id);
  if (!item) {
    return res.status(404).json({ error: `Announcement with id ${req.params.id} not found.` });
  }
  res.status(200).json(withStatus(item));
});

// POST insert
app.post('/api/announcements', (req, res) => {
  const { title, message, date_posted, expiry_date, category } = req.body || {};

  // required fields
  const missing = ['title', 'message', 'date_posted', 'expiry_date', 'category'].filter(
    (f) => typeof req.body?.[f] !== 'string' || !req.body[f].trim()
  );
  if (missing.length) {
    return res.status(400).json({ error: `Missing or empty field(s): ${missing.join(', ')}.` });
  }

  // date format
  if (!isValidDate(date_posted) || !isValidDate(expiry_date)) {
    return res.status(400).json({ error: 'Dates must be valid and use the YYYY-MM-DD format.' });
  }

  // expiry cannot be earlier than posting date
  if (expiry_date < date_posted) {
    return res
      .status(400)
      .json({ error: 'expiry_date cannot be earlier than date_posted.' });
  }

  const data = readData();
  const nextId = data.length ? Math.max(...data.map((a) => a.id)) + 1 : 1;

  const newItem = {
    id: nextId,
    title: title.trim(),
    message: message.trim(),
    date_posted,
    expiry_date,
    category: category.trim(),
  };

  data.push(newItem);
  writeData(data);

  res.status(201).json(withStatus(newItem));
});

// DELETE by ID
app.delete('/api/announcements/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const index = data.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Announcement with id ${req.params.id} not found.` });
  }

  const [removed] = data.splice(index, 1);
  writeData(data);

  res.status(200).json({ message: 'Announcement deleted.', deleted: removed });
});

// Unknown API routes -> JSON 404 (UPDATE/PUT/PATCH are intentionally not implemented)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`Campus Announcement System running at http://localhost:${PORT}`);
});
