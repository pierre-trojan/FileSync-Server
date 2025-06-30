const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup to save files in uploads folder
const upload = multer({ dest: uploadDir });

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log('Received file:', req.file.originalname);
  res.sendStatus(200);
});

// Optional: simple GET route to verify server is running
app.get('/', (req, res) => {
  res.send('FileSync server is running.');
});

// Use environment port or 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FileSync server running at http://localhost:${PORT}`);
});
