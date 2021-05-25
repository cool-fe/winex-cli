/**
 * @description set eslintrc.js config
 * @author dashixiong
 */

import chalk from "chalk";
import fs from "fs";
import { DeafultSharedEslintConfig } from "./config";
import { runPrompts } from "./prompts";
import { Logger } from "./logger";
import { checkEslintConfig, loadConfigFile } from "./utils/config-file";
import assign from "lodash/assign";
import merge from "lodash/merge";
import { basename } from "path";

function hasSpecialTsConfig(projectType: string): boolean {
  return ["node", "vue"].indexOf(projectType) > -1;
}

/**
 * get winex shared eslint config by packageName,projectType,supportTypeScript
 */
function getEslintExtendsConfig(
  packageName: string,
  projectType: string,
  supportTypeScript: boolean
) {
  let result;
  if (!supportTypeScript) {
    result = [`${packageName}/eslintrc.${projectType}.js`];
  } else {
    result = [
      `${packageName}/eslintrc.${projectType}.js`,
      `${packageName}/eslintrc.typescript${
        hasSpecialTsConfig(projectType) ? `-${projectType}` : ""
      }.js`,
    ];
  }
  return result;
}

/**
 * 配置 eslintrc.js 文件的内容
 * 如果存在 eslintrc.js，只修改 extends 字段
 * 如果不存在 eslintrc.js，提供默认的 eslintrc.js 文件
 */
async function configEslintRC(projectType: string, supportTypeScript: boolean) {
  const eslintRcPath = `${process.cwd()}/.eslintrc.js`;
  let checkResult = checkEslintConfig(process.cwd());
  const packageName = Object.keys(DeafultSharedEslintConfig)[0];
  const eslintConfigPath = getEslintExtendsConfig(
    packageName,
    projectType,
    supportTypeScript
  );
  const eslintConfigContent = `
    //https://eslint.org/docs/user-guide/configuring
    module.exports = ${JSON.stringify(
      {
        root: true,
        extends: eslintConfigPath,
      },
      null,
      2
    )}`;

  // 根据优先级规则，eslintrc.js 的优先级最高，如果该项目目前不存在 eslintrc.js,
  // 则生成 eslintrc.js 作为最优配置文件，以优先级覆盖其他配置
  // 旧的配置文件不进行处理，也不进行规则的拷贝处理
  if (checkResult.length) {
    // 存在 eslint 配置文件, 询问是否扩展
    const nestedStr = checkResult.length
      ? `，如下配置：${checkResult.join(",")}将会被迁移`
      : "";

    const answer = await runPrompts<{ eslint: boolean }>({
      type: "toggle",
      message: `eslint配置已存在，是否增加标准配置${nestedStr}(Y/n)?`,
      name: "eslint",
      initial: true,
    });

    if (answer.eslint) {
      Logger.info(chalk.green("合并配置，更新 .eslintrc.js 配置文件..."));

      let newFileJSON = {};
      for (const oldFile of checkResult) {
        const eslintRcOld = `${process.cwd()}/${oldFile}`;
        // 对旧的配置做合并处理
        const fileJSON = loadConfigFile({ filePath: eslintRcOld });
        newFileJSON = merge(newFileJSON, fileJSON) as any;
        if (basename(eslintRcOld) === "package.json") {
        } else {
          fs.unlinkSync(eslintRcOld);
        }
      }
      const newFileContent = ` ${JSON.stringify(
        assign(newFileJSON, {
          extends: eslintConfigPath,
        }),
        null,
        2
      )};\n`;

      fs.writeFileSync(eslintRcPath, `module.exports = ${newFileContent}`);
      Logger.info(
        chalk.yellow(`\n👏 eslint配置更新完成, please check for sure. \n`)
      );
      // 替换有extends配置的情况,逻辑展示保留
      // const modifyResult = fileUtil.syncModifyFile(
      //   eslintRcPath,
      //   /(?<=["']?extends["']?:\s)('[^']+?'|"[^"]+?"|\[[^]+?\])/,
      //   JSON.stringify(eslintConfigPath),
      //   "utf-8"
      // );
      // if (modifyResult === 1) {
      //   Logger.info(
      //     chalk.yellow(`\n👏 eslint配置更新完成，please check for sure. \n`)
      //   );
      // } else if (modifyResult === 0) {
      //   // 替换无extends配置的情况
      //   const addExtendsResult = fileUtil.syncModifyFile(
      //     eslintRcPath,
      //     /(?<=module.exports[\s]?=[\s]?{)/,
      //     `
      //     extends: ${JSON.stringify(eslintConfigPath)},
      //     `,
      //     "utf-8"
      //   );
      //   if (addExtendsResult === 1) {
      //     Logger.info(
      //       chalk.yellow(`\n👏 eslint配置更新完成, please check for sure. \n`)
      //     );
      //   } else {
      //     Logger.error(
      //       chalk.red("eslintrc.js 配置文件更新失败，请查看具体的错误信息")
      //     );
      //     process.exit(0);
      //   }
      // } else {
      //   Logger.error(
      //     chalk.red("eslintrc.js 配置文件更新失败，请查看具体的错误信息")
      //   );
      //   process.exit(0);
      // }
    } else {
      Logger.info(chalk.red("放弃升级eslint配置，请手动进行eslint配置"));
    }
  } else {
    // 不存在 eslint 配置文件, copy 模板到新建 eslintrc.js 文件
    Logger.info(chalk.green("检测到该项目尚无 eslintrc.js 配置文件"));
    Logger.info(chalk.green("复制标准 eslintrc.js 配置模板到项目空间..."));
    fs.writeFileSync(
      `${process.cwd()}/.eslintrc.js`,
      eslintConfigContent,
      "utf-8"
    );
    Logger.info(
      chalk.yellow(`\n👏 eslint配置更新完成, please check for sure. \n`)
    );
  }
}

export default configEslintRC;
