const path = require('path');
const fs = require('fs');
const { stdout } = require('process');

const stylesFolder = path.join(__dirname, 'styles');
const bundleFile = path.join(__dirname, 'project-dist', 'bundle.css');

const writeToBundle = fs.createWriteStream(bundleFile);

fs.readdir(stylesFolder, { withFileTypes: true }, (error, files) => {
  if (error) {
    throw error;
  }

  for (const file of files) {
    if (file.isFile()) {
      try {
        const pathToCSSFile = path.join(stylesFolder, file.name);
        const fileExt = path.extname(pathToCSSFile).slice(1);
        if (fileExt === 'css') {
          const cssFile = fs.createReadStream(pathToCSSFile);
          let sccData = '';
          cssFile.on('data', (chunk) => (sccData += chunk));
          cssFile.on('end', () => writeToBundle.write(sccData));
          cssFile.on('error', (error) => stdout.write(`${error.message}\n`));
        }
      } catch (error) {
        stdout.write(`${error.message}\n`);
      }
    }
  }
});
