import { fs, path, globby, datatypes } from '../../shared-utils';

const { isString } = datatypes;

function fileToComponentName(file: string) {
  return file.replace(/\/|\\/g, '-');
}

async function resolveComponents(componentDir: string): Promise<string[]> {
  if (!fs.existsSync(componentDir)) {
    return [];
  }
  const files = await globby(['indev.vue', 'index.js'], { cwd: componentDir });
  return files;
}

// Since this plugin can ben used by multiple times, we need to
// give each generated files a uid or the previous file would be
// overwritten.
let moduleId = 0;

export default (options: any) => ({
  multiple: true,

  async enhanceAppFiles() {
    const { componentsDir = [], components = [], getComponentName = fileToComponentName } = options;
    const baseDirs = Array.isArray(componentsDir) ? componentsDir : [componentsDir];

    function importCode(name: any, absolutePath: string) {
      return `Vue.component(${JSON.stringify(name)}, () => import(${JSON.stringify(
        absolutePath
      )}))`;
    }

    function genImport(baseDir: string, file: string) {
      const name = getComponentName(file);
      const absolutePath = path.resolve(baseDir, file);
      const code = importCode(name, absolutePath);
      return code;
    }

    let code = '';

    // 1. Register components in specified directories
    // eslint-disable-next-line no-restricted-syntax
    for (const baseDir of baseDirs) {
      if (!isString(baseDir)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const files = (await resolveComponents(baseDir)) || [];
      code += `${files.map((file) => genImport(baseDir, file)).join('\n')}\n`;
    }

    // 2. Register named components.
    //@ts-ignore
    code += components.map(({ name, path: absolutePath }) => importCode(name, absolutePath));

    code = `import Vue from 'vue'\n${code}\n`;

    return [
      {
        // eslint-disable-next-line no-plusplus
        name: `global-components-${++moduleId}.js`,
        content: code
      }
    ];
  }
});
