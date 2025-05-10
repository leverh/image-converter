const express = require('express');
const multer = require('multer');
const path = require('path');
const imageConversion = require('./imageConversion');

const app = express();
const port = 3000;

// Set up multer for file uploads (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Image conversion endpoint
app.post('/convert', upload.array('images'), async (req, res) => {
  const format = req.body.format;
  const quality = parseInt(req.body.quality, 10) || 80;
  const width = parseInt(req.body.width, 10) || null;
  
  if (!req.files || req.files.length === 0 || !['webp', 'png', 'jpeg', 'gif'].includes(format)) {
    return res.status(400).send('Invalid request. Please check file uploads and format.');
  }
  
  try {
    if (req.files.length === 1) {
      const file = req.files[0];
      const { buffer, filename } = await imageConversion.convertSingleImage(file, format, quality, width);
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.${format}"`);
      res.setHeader('Content-Type', `image/${format}`);
      return res.send(buffer);
    } else {
      // Multiple files: always return zip
      const zipBuffer = await imageConversion.convertMultipleImages(req.files, format, quality, width);
      
      res.setHeader('Content-Disposition', 'attachment; filename="converted_images.zip"');
      res.setHeader('Content-Type', 'application/zip');
      return res.send(zipBuffer);
    }
  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).send('Image conversion failed: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`🚀 Image converter running at http://localhost:${port}`);
});