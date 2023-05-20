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
      console.log(`Compiling ${filePath}...`);

      const content = readFileSync(filePath, 'utf8');
      const preamble = readFileSync('./preambule.tex', 'utf8');
      const tmpFilePath = join(tmpdir(), basename(filePath));
      const tmpFileContent = `${preamble}\n\\begin{document}\n${content}\n\\end{document}\n`;
      writeFileSync(tmpFilePath, tmpFileContent);
      
      execSync(`lualatex --output-directory=${dirPath} ${tmpFilePath}`);
      // execSync(`convert -density 150 ${dirPath}/${basename(filePath, '.tex')}.pdf -quality 90 ${dirPath}/${basename(filePath, '.tex')}.png`);
      
      fs.unlinkSync(tmpFilePath);
    }
  });

  rl.close();
});
