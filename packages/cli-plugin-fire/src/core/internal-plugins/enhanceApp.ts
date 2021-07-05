import { path } from '../../shared-utils';

export default (options, context) => ({
  name: '@fire/internal-enhance-app',

  enhanceAppFiles() {
    const { sourceDir } = context;
    const enhanceAppPath = path.resolve(sourceDir, './app.js');
    const files = [enhanceAppPath];

    return files;
  }
});
