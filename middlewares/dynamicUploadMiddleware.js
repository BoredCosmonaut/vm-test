const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_TYPES = ['businesses', 'campaigns', 'products'];

const getStorage = (type) => {
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error('Geçersiz upload tipi');
  }

  const uploadPath = path.join(__dirname, '..', 'uploads', 'updates', type);
  fs.mkdirSync(uploadPath, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });
};

const dynamicUpload = (type) => {
  const storage = getStorage(type);
  return multer({ storage });
};

module.exports = dynamicUpload;
