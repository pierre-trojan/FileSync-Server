const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const WATCH_FOLDER = path.join(__dirname, 'sync'); // Folder to watch
const SERVER_URL = 'http://localhost:3000/upload'; // Your server's upload endpoint

// Ensure the folder exists
if (!fs.existsSync(WATCH_FOLDER)) {
  fs.mkdirSync(WATCH_FOLDER);
}

console.log('Watching folder:', WATCH_FOLDER);

// Watch the folder for new files
fs.watch(WATCH_FOLDER, (eventType, filename) => {
  if (eventType === 'rename' && filename) {
    const filePath = path.join(WATCH_FOLDER, filename);
    if (fs.existsSync(filePath)) {
      console.log('New file detected:', filename);

      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      axios.post(SERVER_URL, form, {
        headers: form.getHeaders()
      }).then(() => {
        console.log('Uploaded:', filename);
      }).catch((err) => {
  console.error('Upload failed:', err.message);
});
    }
  }
});
