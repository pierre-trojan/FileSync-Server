const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});

const upload = multer({ storage });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    url: `http://localhost:${port}/uploads/${req.file.filename}`
  });
});

// Start the server
app.listen(port, () => {
  console.log(`FileSync server running at http://localhost:${port}`);
});
