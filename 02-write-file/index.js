const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { stdin, stdout } = require('process');

const pathFile = path.resolve(__dirname, './text.txt');
const writeStream = fs.createWriteStream(pathFile, 'utf-8');
let rl = readline.createInterface(stdin, stdout);

stdout.write('Hello! Type text here to write to file:\n');

rl.on('line', (line) =>
  line.trim() === 'exit' ? process.exit() : writeStream.write(`${line}\n`),
);

process.on('exit', () => {
  stdout.write('Goodbye!\n');
  rl.close();
});
