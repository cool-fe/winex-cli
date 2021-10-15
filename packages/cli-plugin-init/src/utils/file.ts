import fs from 'fs-extra';
import { join, dirname } from 'path';

/**
 * 判断路径是否存在
 * @param path 文件路径
 * @returns 存在状态
 */
export const pathExists = (path: string) => fs.existsSync(path);

/**
 * 写文件树
 * @param dir 文件夹名称
 * @param files 文件集合
 */
export const writeFileTree = (dir: string, files: object) => {
  Object.keys(files).forEach((name) => {
    const path = join(dir, name);

    fs.ensureDirSync(dirname(path));
    fs.writeFileSync(path, files[name]);
  });
};

export const readDir = async (path: string): Promise<any> => {
  if (pathExists(path)) {
    return fs.readdir(path);
  }
  return null;
};

/**
 * 更新文件
 */
export const updateFile = (context: string, meta: any) =>
  new Promise((resolve) => {
    const fileName = `${context}/package.json`;

    if (fs.existsSync(fileName)) {
      const content = fs.readFileSync(fileName).toString();
      const result = JSON.parse(content);

      Object.keys(meta).forEach((key) => {
        if (meta[key] !== null) {
          // edit
          result[key] = meta[key];
        } else {
          // delete
          if (result.hasOwnProperty(key)) {
            delete result[key];
          }
        }
      });

      fs.writeFileSync(fileName, JSON.stringify(result, null, 2));
      resolve(true);
    }
  });
