const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Create uploads folder if missing
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware to serve uploaded files
app.use('/uploads', express.static(uploadDir));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Home route: list uploaded files + success message if synced
app.get('/', (req, res) => {
  const status = req.query.status;
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Error reading uploaded files');

    const fileLinks = files.map(file =>
      `<li><a href="/uploads/${file}" target="_blank">${file}</a></li>`
    ).join('');

    res.send(`
      <html>
        <head><title>FileSync Uploads</title></head>
        <body>
          <h1>📁 Uploaded Files</h1>
          ${status === 'success' ? '<p style="color: green;">✅ Sync successful!</p>' : ''}
          <ul>${fileLinks || '<li>No files uploaded yet.</li>'}</ul>
        </body>
      </html>
    `);
  });
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.redirect('/?status=success');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FileSync server running at http://localhost:${PORT}`);
});
