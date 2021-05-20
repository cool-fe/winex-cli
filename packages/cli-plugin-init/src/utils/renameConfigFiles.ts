import path from "path";
import fs from "fs";

const CONFIG_FILES: string[] = [
  "_eslintrc.js",
  "_eslintrc",
  "_eslintignore",
  "_gitignore",
  "_stylelintrc.js",
  "_stylelintrc",
  "_stylelintignore",
  "_editorconfig",
  "_prettierrc.js",
  "_prettierignore",
  "readme.md",
];

/**
 * 将_文件改为.文件(npm文件格式要求)
 * _eslintrc.js -> .eslintrc.js
 * @param fileName npm包外层文件名称
 * @returns 格式化之后的文件名
 */
export function renameConfigFiles(dir: string, files: string[]): void {
  files.forEach((oldName: string) => {
    if (CONFIG_FILES.includes(oldName)) {
      const newName = oldName.replace(/^_/, ".");

      const newPath = path.join(dir, newName);
      const oldPath = path.join(dir, oldName);

      fs.rename(oldPath, newPath, (err: any) => {
        if (err) throw err;
      });
    }
  });
}
