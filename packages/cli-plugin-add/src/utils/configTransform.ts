import path from 'path';
import fs from 'fs';

/**
 * material-demo transform materialDemo
 */
function toHump(value: string): string {
  return value.replace(/(-\w)/g, function (letter) {
    return letter.substring(1).toUpperCase();
  });
}

/**
 * @param {String} pluginName -- full name of the package to get
 *
 * Create and write configuration information
 */
export function configTransform(pluginName: string, context: string): void {
  const [_scope, name] = pluginName.split('/'); // scope

  const root = path.resolve(context, `./${name}.js`); // root
  const humpName = toHump(name);
  const imports = [
    `import Vue from 'vue';`,
    `import ${humpName} from '${pluginName}';`,
    `// theme-chalk css`,
    `Vue.use(${humpName});`,
  ];

  fs.writeFileSync(root, imports.join('\n\n'), { encoding: 'utf-8' });
};
