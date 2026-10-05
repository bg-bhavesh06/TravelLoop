const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { handleUploadResponse } = require('../controllers/uploadController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'traveloop_avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage: storage });

router.post('/', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: err.message || 'Upload failed', details: err });
    }
    handleUploadResponse(req, res);
  });
});

module.exports = router;
