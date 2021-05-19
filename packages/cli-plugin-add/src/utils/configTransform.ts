const fs = require('fs');
import path from 'path';

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
module.exports = async function configTransform(pluginName: string, context: string): Promise<void> {
  const [_scope, name] = pluginName.split('/'); // scope

  const root = path.resolve(context, `./${name}.js`); // root
  const humpName = toHump(name);
  const imports = [
    `import Vue from 'vue';`,
    `import ${humpName} from '${pluginName}';`,
    `// theme-chalk css`,
    `Vue.use(${humpName});`,
  ];

  fs.writeFileSync(root, imports.join('\n\n'), { encoding: 'utf-8' }, function (err: Error) {
    if (err) {
      throw err;
    }
  });
};
