import path from 'path'
import fs from 'fs'
import isFileEsm from 'is-file-esm'

export default (context: string): object => {
  let fileConfig: object = {};
  let fileConfigPath: string = "";

  const possibleConfigPaths: string = "./winex.config.js"
  const resolvedPath: string = possibleConfigPaths ? path.resolve(context, possibleConfigPaths) : '';
  if(resolvedPath && fs.existsSync(resolvedPath)) {
    fileConfigPath = resolvedPath
  }
  if (fileConfigPath) {
    const { esm } = isFileEsm.sync(fileConfigPath);
    if (esm) {
      fileConfig = import(fileConfigPath);
    } else {
      fileConfig = require(fileConfigPath);
    }
  }
  return fileConfig
}

