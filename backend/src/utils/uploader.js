// src/utils/uploader.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToS3 } = require('./s3');
const logger = require('../config/logger');

// Local storage for temporary uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter for allowed mime types
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'), false);
  }
  cb(null, true);
};

// Initialize multer
const upload = (allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']) =>
  multer({ storage, fileFilter: fileFilter(allowedTypes), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB max

/**
 * Upload file to S3 and remove local temp file
 * @param {string} localPath
 * @param {string} s3Key
 */
const uploadFileToS3 = async (localPath, s3Key) => {
  try {
    const result = await uploadToS3(localPath, s3Key);
    fs.unlinkSync(localPath); // remove local temp file
    logger.info(`File uploaded to S3: ${s3Key}`);
    return result;
  } catch (err) {
    logger.error('S3 upload failed ❌', err);
    throw err;
  }
};

module.exports = { upload, uploadFileToS3 };
