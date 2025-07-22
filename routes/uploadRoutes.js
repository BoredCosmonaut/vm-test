const express = require('express');
const router = express.Router();
const dynamicUpload = require('../middlewares/dynamicUploadMiddleware');
const { uploadFile, listFiles, getImage } = require('../controllers/uploadController');

const ALLOWED_TYPES = ['businesses', 'campaigns', 'products'];


router.post('/upload/:type', (req, res, next) => {
  const { type } = req.params;
  console.log("Gelen tip:", type);

  if (!ALLOWED_TYPES.includes(type)) {
    console.log("Geçersiz type geldi:", type);
    return res.status(400).json({ error: 'Geçersiz tip' });
  }

  const upload = dynamicUpload(type).single('file');
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Yükleme hatası', detail: err.message });
    }
    next();
  });
}, uploadFile);



router.get('/uploads/:type/list', listFiles);


router.get('/uploads/:type/:filename', getImage);

module.exports = router;
