import { cosmiconfigSync } from 'cosmiconfig';
import { dirname } from 'path';
import { printErrorAndExit } from '../utils/print';

export default function materialProject(
  cwd: string
): {
  config: any;
  rootConfigLocation: string;
  rootPath: string;
} | null {
  const explorer = cosmiconfigSync('materialConfig', {
    searchPlaces: ['package.json']
  });

  let loaded;

  try {
    loaded = explorer.search(cwd);
  } catch (err) {
    // redecorate JSON syntax errors, avoid debug dump
    if (err.name === 'JSONError') {
      printErrorAndExit(err.message);
    }
  }
  if (loaded)
    return {
      config: loaded.config,
      rootConfigLocation: loaded.filepath,
      rootPath: dirname(loaded.filepath)
    };
  else return null;
}
