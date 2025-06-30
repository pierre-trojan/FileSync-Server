const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const syncFolder = path.join(__dirname, 'sync');
const serverURL = 'https://filesync-server.onrender.com';

console.log(`Watching folder: ${syncFolder}`);

chokidar.watch(syncFolder).on('all', async (event, filePath) => {
  const fileName = path.basename(filePath);

  if (event === 'add') {
    console.log(`New file detected: ${fileName}`);

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    try {
      await axios.post(`${serverURL}/upload`, form, {
        headers: form.getHeaders()
      });
      console.log(`Uploaded: ${fileName}`);
    } catch (err) {
      console.error(`Upload failed: ${err.message}`);
    }

  } else if (event === 'unlink') {
    console.log(`File deleted: ${fileName}`);

    try {
      await axios.post(`${serverURL}/delete-sync/${fileName}`);
      console.log(`Deleted on server: ${fileName}`);
    } catch (err) {
      console.error(`Server deletion failed: ${err.message}`);
    }
  }
});
