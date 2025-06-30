const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const WATCH_FOLDER = path.join(__dirname, 'sync');
const SERVER_UPLOAD_URL = 'https://filesync-server.onrender.com/upload';
const SERVER_DELETE_URL = 'https://filesync-server.onrender.com/delete';

if (!fs.existsSync(WATCH_FOLDER)) {
  fs.mkdirSync(WATCH_FOLDER);
}

console.log('Watching folder:', WATCH_FOLDER);

const uploadedMap = new Map(); // local name → uploaded name

const watcher = chokidar.watch(WATCH_FOLDER, { ignoreInitial: true });

watcher.on('add', filePath => {
  const fileName = path.basename(filePath);
  console.log('New file detected:', fileName);

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  axios.post(SERVER_UPLOAD_URL, form, { headers: form.getHeaders() })
    .then(res => {
      // Extract uploaded filename from redirect URL
      const redirectedUrl = res.request.res.responseUrl;
      const uploadedFilename = redirectedUrl.split('-').slice(1).join('-');
      uploadedMap.set(fileName, uploadedFilename);
      console.log('Uploaded:', uploadedFilename);
    })
    .catch(err => {
      console.error('Upload failed:', err.message);
    });
});

watcher.on('unlink', filePath => {
  const fileName = path.basename(filePath);
  console.log('File deleted:', fileName);

  if (!uploadedMap.has(fileName)) {
    console.warn(`No uploaded filename tracked for ${fileName}, cannot delete on server.`);
    return;
  }

  axios.delete(`${SERVER_DELETE_URL}/${fileName}`)
    .then(() => {
      console.log('Deleted on server:', fileName);
      uploadedMap.delete(fileName);
    })
    .catch(err => {
      console.error('Server deletion failed:', err.message);
    });
});
