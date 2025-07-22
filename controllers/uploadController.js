const path = require('path');
const fs = require('fs');

// Yardımcı fonksiyon: doğru tabloyu döner
const getTableNameForType = (type) => {
  const mapping = {
    businesses: 'uploaded_files_businesses',
    campaigns: 'uploaded_files_campaigns',
    products: 'uploaded_files_products'
  };

  if (!mapping[type]) {
    throw new Error('Geçersiz kategori tipi: ' + type);
  }

  return mapping[type];
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi.' });

    const type = req.params.type;
    const tableName = getTableNameForType(type);

    const fileName = req.file.filename;
    const fileUrl = `/uploads/updates/${type}/${fileName}`;

    const pool = req.app.get('db');
    await pool.query(
      `INSERT INTO ${tableName} (filename, url) VALUES ($1, $2)`,
      [fileName, fileUrl]
    );

    res.status(200).json({ message: 'Yükleme başarılı', url: fileUrl });
  } catch (err) {
    console.error('Upload hatası:', err);
    res.status(500).json({ error: 'Yükleme sırasında hata oluştu.' });
  }
};

const listFiles = async (req, res) => {
  try {
    const type = req.params.type;
    const tableName = getTableNameForType(type);

    const pool = req.app.get('db');
    const result = await pool.query(
      `SELECT url FROM ${tableName} ORDER BY id DESC`
    );

    res.json({ files: result.rows.map(row => row.url) });
  } catch (err) {
    console.error('Listeleme hatası:', err);
    res.status(500).json({ error: 'Listeleme sırasında hata oluştu.' });
  }
};

const getImage = (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, '..', 'uploads', 'updates', type, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).json({ error: 'Dosya bulunamadı' });
    res.sendFile(filePath);
  });
};

module.exports = { uploadFile, listFiles, getImage };
