/* eslint-disable no-param-reassign */
import { fs, path, chalk, logger } from '../shared-utils';

let alreadyEmptied = false;

/**
 * Create a dynamic temp utility context that allow to lanuch
 * multiple apps with isolated context at the same time.
 * @param tempPath
 * @returns {{
 *  writeTemp: (function(file: string, content: string): string),
 *  tempPath: string
 * }}
 */

export default function createTemp(tempPath?: string) {
  if (!tempPath) {
    tempPath = path.resolve(__dirname, '../.temp');
  } else {
    //@ts-ignore
    tempPath = path.resolve(tempPath);
  }

  if (!fs.existsSync(tempPath)) {
    fs.ensureDirSync(tempPath);
  } else if (!alreadyEmptied) {
    fs.emptyDirSync(tempPath);
    alreadyEmptied = true;
  }

  logger.debug(`Temp directory: ${chalk.gray(tempPath)}`);
  const tempCache = new Map();

  async function writeTemp(file: string, content: any) {
    const destPath = path.join(tempPath, file);
    await fs.ensureDir(path.parse(destPath).dir);
    // cache write to avoid hitting the dist if it didn't change
    const cached = tempCache.get(file);
    if (cached !== content) {
      await fs.writeFile(destPath, content);
      tempCache.set(file, content);
    }
    return destPath;
  }

  return { writeTemp, tempPath };
}
