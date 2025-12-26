// src/utils/sharp.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

/**
 * Resize and optimize image
 * @param {string} inputPath - path to original image
 * @param {string} outputPath - path to save processed image
 * @param {object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {string} [options.format] - 'jpeg', 'png', 'webp'
 * @param {number} [options.quality] - 1-100
 */
const processImage = async (inputPath, outputPath, options = {}) => {
  try {
    const { width, height, format = 'jpeg', quality = 80 } = options;

    let img = sharp(inputPath);

    if (width || height) {
      img = img.resize(width, height, { fit: 'cover' });
    }

    switch (format.toLowerCase()) {
      case 'jpeg':
        img = img.jpeg({ quality });
        break;
      case 'png':
        img = img.png({ quality });
        break;
      case 'webp':
        img = img.webp({ quality });
        break;
      default:
        img = img.jpeg({ quality });
        break;
    }

    await img.toFile(outputPath);
    logger.info(`Image processed and saved at ${outputPath} ✅`);
  } catch (err) {
    logger.error('Image processing failed ❌', err);
    throw err;
  }
};

/**
 * Delete file
 * @param {string} filePath
 */
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    logger.info(`Deleted file: ${filePath}`);
  }
};

module.exports = { processImage, deleteFile };
