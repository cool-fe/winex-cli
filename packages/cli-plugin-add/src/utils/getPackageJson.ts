import path from 'path';

const fs = require('fs-extra');

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

async function getPackageJson(projectPath: string): Promise<any> {
  let packageJson = await checkPackageJson(projectPath);

  try {
    packageJson = JSON.parse(packageJson);
  } catch (err) {
    throw new Error('The package.json is malformed');
  }

  return packageJson;
}

module.exports = {
  checkPackageJson,
  getPackageJson,
};
