const { path } = require('@vuepress/shared-utils');

module.exports = (options, context) => ({
  name: '@vuepress/internal-enhance-app',

  enhanceAppFiles() {
    const { sourceDir } = context;
    const enhanceAppPath = path.resolve(sourceDir, '.vuepress/enhanceApp.js');
    const files = [enhanceAppPath];

    return files;
  }
});
