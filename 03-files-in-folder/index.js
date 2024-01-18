const path = require('path');
const fs = require('fs');
const { readdir } = require('fs/promises');
const { stdout } = require('process');

async function printFileInfo(folder) {
  const pathFolder = path.join(__dirname, folder);
  const files = await readdir(pathFolder, { withFileTypes: true });

  files.forEach((file) => {
    if (file.isFile()) {
      const pathToFile = path.join(pathFolder, file.name);
      fs.stat(pathToFile, (error, stats) => {
        if (error) {
          throw error;
        }

        const fileInfo = path.parse(pathToFile);
        const fileSize = (stats.size / 1024).toFixed(3);
        stdout.write(
          `${fileInfo.name} - ${fileInfo.ext.slice(1)} - ${fileSize}kb\n`,
        );
      });
    }
  });
}

printFileInfo('secret-folder');
