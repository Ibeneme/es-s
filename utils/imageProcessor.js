const sharp = require("sharp");

/**
 * Compresses and resizes an image buffer.
 */
async function processImage(buffer) {
  return await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true }) // Limit max width
    .webp({ quality: 80 }) // Convert to WebP for smaller size/high quality
    .toBuffer();
}

module.exports = { processImage };
