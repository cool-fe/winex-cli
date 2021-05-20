import path from 'path';
import fs from 'fs-extra';

/**
 * @param {String} projectPath -- context path
 *
 * check package.json exist
 */
async function checkPackageJson(projectPath: string): Promise<any> {
  const packagePath = path.join(projectPath, 'package.json');

  let packageJson;

  try {
    packageJson = fs.readFileSync(packagePath, 'utf-8');
  } catch (err) {
    throw new Error(`The package.json file at '${packagePath}' does not exist`);
  }

  return packageJson;
}

/**
 * @param {String} projectPath -- context path
 *
 * get package.json
 */
async function getPackageJson(projectPath: string): Promise<any> {
  let packageJson = await checkPackageJson(projectPath);

  try {
    packageJson = JSON.parse(packageJson);
  } catch (err) {
    throw new Error('The package.json is malformed');
  }

  return packageJson;
}

export {
  checkPackageJson,
  getPackageJson,
};
