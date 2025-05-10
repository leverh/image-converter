const sharp = require('sharp');
const path = require('path');
const JSZip = require('jszip');

/**
 * Converts a single image file
 * @param {Object} file - The file object from multer
 * @param {string} format - The output format (webp, png, jpeg, gif)
 * @param {number} quality - Image quality (0-100)
 * @param {number|null} width - Resize width (null for no resize)
 * @returns {Promise<{buffer: Buffer, filename: string}>} - The converted image and filename
 */
async function convertSingleImage(file, format, quality, width) {
  let transformer = sharp(file.buffer);
  
  if (width) {
    transformer = transformer.resize({ width });
  }
  
  if (['jpeg', 'png', 'webp'].includes(format)) {
    transformer = transformer.toFormat(format, { quality });
  } else {
    transformer = transformer.toFormat(format);
  }
  
  const buffer = await transformer.toBuffer();
  const filename = path.parse(file.originalname).name;
  
  return { buffer, filename };
}

/**
 * Converts multiple images and packages them in a ZIP file
 * @param {Array} files - Array of file objects from multer
 * @param {string} format - The output format (webp, png, jpeg, gif)
 * @param {number} quality - Image quality (0-100)
 * @param {number|null} width - Resize width (null for no resize)
 * @returns {Promise<Buffer>} - ZIP file as buffer
 */
async function convertMultipleImages(files, format, quality, width) {
  const zip = new JSZip();
  
  for (const file of files) {
    const { buffer, filename } = await convertSingleImage(file, format, quality, width);
    zip.file(`${filename}.${format}`, buffer);
  }
  
  return await zip.generateAsync({ type: 'nodebuffer' });
}

module.exports = {
  convertSingleImage,
  convertMultipleImages
};