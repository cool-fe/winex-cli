import fs from 'fs';
import path from 'path';
import glob from 'glob';
import chalk from 'chalk';

const OUTPUT_PATH = path.join(__dirname, '../');
const OUTPUT_FILE = path.join(OUTPUT_PATH, './local/components.json');
const filterPath = path.join(__dirname, '../components/*/lib/index.js');

export default function writeComponentsConf(): void {
  const filterFiles = glob.sync(filterPath, { matchBase: true });
  const conf = new Map();
  console.log(filterFiles, 'filterFiles');
  filterFiles.forEach((packagePath) => {
    const componentNames = path
      .dirname(packagePath)
      .split('components/')[1]
      .split('/');
    conf[componentNames[0]] = `./${path.relative(OUTPUT_PATH, packagePath)}`;
  });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(conf, null, 2));
  console.log(chalk.bgGreen('[gen components config] SUCCESS'));
}
