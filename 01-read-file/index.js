const path = require('path');
const fs = require('fs');
const { stdout } = require('process');

const pathFile = path.resolve(__dirname, './text.txt');
const readStream = fs.createReadStream(pathFile, 'utf-8');
let data = '';

readStream.on('data', (chunk) => (data += chunk));
readStream.on('end', () => stdout.write(data));
readStream.on('error', (error) => stdout.write(error.message));
