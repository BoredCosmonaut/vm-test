const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: process.env.PG_SSL === 'true'
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('Dosya yüklenemedi.');

  const fileUrl = `/uploads/${req.file.filename}`;
  const fileName = req.file.filename;
  const filePath = fileUrl;

  try {
    const client = await pool.connect();
    await client.query(
      'INSERT INTO uploaded_files(filename, url) VALUES ($1, $2)',
      [fileName, filePath]
    );
    client.release();
    res.send(`<p>Upload successful! <a href="${fileUrl}" target="_blank">View image</a></p>`);
  } catch (err) {
    res.status(500).send('Veritabanına kaydedilemedi.');
  }
});

app.get('/uploads/list', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT url FROM uploaded_files ORDER BY id DESC');
    client.release();
    const files = result.rows.map(row => row.url);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Dosyalar listelenemedi.' });
  }
});

app.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('Dosya bulunamadı');
    res.sendFile(filePath);
  });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});
