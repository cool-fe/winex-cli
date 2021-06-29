/**
 * Module dependencies.
 */

import { fs, chalk, logger, codegen, datatypes } from '../../../shared-utils';
import AsyncOption from '../abstract/AsyncOption';

const { pathsToModuleCode } = codegen;
const { isPlainObject } = datatypes;

/**
 * enhanceAppFiles option.
 */

export default class EnhanceAppFilesOption extends AsyncOption {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  //@ts-ignore
  async apply(ctx: any) {
    await super.asyncApply();

    const manifest = [];
    let moduleId = 0;

    // eslint-disable-next-line @typescript-eslint/no-shadow
    async function writeEnhancer(name: number, content: string, hasDefaultExport = true) {
      // eslint-disable-next-line no-return-await
      return await ctx.writeTemp(
        `app-enhancers/${name}.js`,
        hasDefaultExport ? content : `${content}\nexport default {}`
      );
    }

    // 1. write enhance app files.
    // eslint-disable-next-line no-restricted-syntax
    for (const { value: enhanceAppFile, name: pluginName } of this.appliedItems) {
      let destPath;

      // 1.1 dynamic code
      if (isPlainObject(enhanceAppFile)) {
        const { content } = enhanceAppFile;
        let { name } = enhanceAppFile;
        name = name.replace(/.js$/, '');

        // eslint-disable-next-line no-use-before-define
        if (hasDefaultExport(content)) {
          destPath = await writeEnhancer(name, content);
        } else {
          destPath = await writeEnhancer(name, content, false /* do not contain default export*/);
        }
        // 1.2 pointing to a file
      } else {
        if (fs.existsSync(enhanceAppFile)) {
          const content = await fs.readFile(enhanceAppFile, 'utf-8');

          // eslint-disable-next-line no-use-before-define
          if (hasDefaultExport(content)) {
            destPath = await writeEnhancer(
              // eslint-disable-next-line no-plusplus
              moduleId++,
              `export { default } from ${JSON.stringify(enhanceAppFile)}`
            );
          } else {
            destPath = await writeEnhancer(
              // eslint-disable-next-line no-plusplus
              moduleId++,
              `import ${JSON.stringify(enhanceAppFile)}`,
              false /* do not contain default export*/
            );
          }
        } else {
          logger.developer(
            `${chalk.gray(`[${pluginName}] `)}${chalk.cyan(enhanceAppFile)} Not Found.`
          );
        }
      }

      if (destPath) {
        manifest.push(destPath);
      }
    }

    // 2. write entry file.
    await ctx.writeTemp('internal/app-enhancers.js', pathsToModuleCode(manifest));
  }
}

function hasDefaultExport(content: string | string[]) {
  return content.includes('export default') || content.includes('module.exports');
}
