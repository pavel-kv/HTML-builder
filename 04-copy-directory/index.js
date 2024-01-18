const path = require('path');
const { stdout } = require('process');
const { mkdir, rm, readdir, copyFile } = require('fs/promises');

async function copyDirectory(src, dest) {
  const srcFolder = path.join(__dirname, src);
  const destFolder = path.join(__dirname, dest);

  try {
    await rm(destFolder, { recursive: true, force: true });
    const createdDir = await mkdir(destFolder, { recursive: true });
    if (createdDir) {
      stdout.write(`Directory successfully created: ${createdDir}\n`);
    }
  } catch (error) {
    console.error(error.message);
  }

  const files = await readdir(srcFolder, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      try {
        const srcFile = path.join(srcFolder, file.name);
        const destFile = path.join(destFolder, file.name);
        await copyFile(srcFile, destFile);
        stdout.write(`File successfully copied: ${file.name}\n`);
      } catch (error) {
        stdout.write(`${error.message}\n`);
      }
    } else {
      try {
        const subDir = path.join(destFolder, file.name);
        await mkdir(subDir, { recursive: true });
        copyDirectory(path.join(src, file.name), path.join(dest, file.name));
      } catch (error) {
        stdout.write(`${error.message}\n`);
      }
    }
  }
}

copyDirectory('files', 'files-copy');
