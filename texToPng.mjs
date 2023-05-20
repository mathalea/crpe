import { readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, basename } from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Entrez le chemin du répertoire : ', (dirPath) => {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(`Impossible de lire le répertoire ${dirPath}`);
      process.exit(1);
    }

    const texFiles = files.filter(file => path.extname(file) === '.tex');

    for (const file of texFiles) {
      const filePath = path.join(dirPath, file);
      
      const content = readFileSync(filePath, 'utf8');
      const preamble = readFileSync('./preambule.tex', 'utf8');
      const tmpFilePath = join('tmp', filePath);
      const tmpFileContent = `\\documentclass[preview,border=5pt]{standalone}\n${preamble}\n\\begin{document}\n${content}\n\\end{document}\n`;
      writeFileSync(tmpFilePath, tmpFileContent);
      
      console.log(`lualatex ${tmpFilePath}...`);
      // try {
      //   execSync(`lualatex ${tmpFilePath}`);
      // } catch (error) {
      //   console.log(`${tmpFilePath} n'a pas pu être compilé.`)
      //   console.log(error);
      // }
      try {
        execSync(`convert -density 150 -background white -flatten ./${basename(filePath, '.tex')}.pdf -quality 90 ./${basename(filePath, '.tex')}.png`);
      } catch (error) {
        console.log(`${tmpFilePath} n'a pas pu être converti en png.`)        
      }
      
      //fs.unlinkSync(tmpFilePath);
    }
  const filesCurrentDir = fs.readdirSync('./');
  const auxFiles = filesCurrentDir.filter(file => (path.extname(file) === '.aux' || path.extname(file) === '.log'));
  for (const file of auxFiles) {
    fs.unlinkSync(file);
  }
  });

  rl.close();
});
