const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

let uploadedMap = {}; // Map: original filename → uploaded filename

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  // Track uploaded name
  uploadedMap[req.file.originalname] = req.file.filename;
  res.redirect('/?status=success');
});

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

// Delete endpoint
app.delete('/delete/:originalName', (req, res) => {
  const originalName = req.params.originalName;
  const storedName = uploadedMap[originalName];

  if (!storedName) return res.status(404).send('File not found on server');

  const filePath = path.join(uploadDir, storedName);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send('Failed to delete file');
    delete uploadedMap[originalName];
    res.send('File deleted');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FileSync server running at http://localhost:${PORT}`);
});
