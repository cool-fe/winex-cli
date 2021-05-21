/**
 * @description set eslintrc.js config
 * @author dashixiong
 */

import chalk from "chalk";
import fs from "fs";
import fileUtil from "./utils/file";
import { DeafultSharedEslintConfig } from "./config";
import { runPrompts } from "./prompts";
import { Logger } from "./logger";
import { checkEslintConfig } from "./utils/config-file";
import assign from "lodash/assign";

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
  const checkResult = checkEslintConfig(process.cwd());
  if (checkResult.length) {
    Logger.info(
      chalk.green("检测到如下eslint配置文件\n"),
      checkResult.join("\n")
    );
  }
  const exsit = await fileUtil.checkExist(eslintRcPath, false);
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

  const filterJs = checkResult.filter(
    (file) => file && file !== ".eslintrc.js"
  );

  filterJs.length &&
    Logger.info(
      chalk.green("我们会忽略并删除如下eslint 配置文件\n"),
      filterJs.join("\n")
    );
  // 根据优先级规则，eslintrc.js 的优先级最高，如果该项目目前不存在 eslintrc.js,
  // 则生成 eslintrc.js 作为最优配置文件，以优先级覆盖其他配置
  // 旧的配置文件不进行处理，也不进行规则的拷贝处理
  if (exsit) {
    // 存在 eslint 配置文件, 询问是否扩展
    const nestedStr = filterJs.length
      ? `，如下配置：${filterJs.join(",")}将会被迁移`
      : "";
    const answer = await runPrompts<{ eslint: boolean }>({
      type: "toggle",
      message: `eslint配置已存在，是否增加标准配置${nestedStr}(Y/n)?`,
      name: "eslint",
      initial: true,
    });

    if (answer.eslint) {
      Logger.info(chalk.green("更新当前 eslintrc.js 配置文件，增加 extend..."));
      // 替换有extends配置的情况
      const modifyResult = fileUtil.syncModifyFile(
        eslintRcPath,
        /(?<=["']?extends["']?:\s)('[^']+?'|"[^"]+?"|\[[^]+?\])/,
        JSON.stringify(eslintConfigPath),
        "utf-8"
      );
      if (modifyResult === 1) {
        Logger.info(chalk.green("eslintrc.js 配置文件更新完成"));
      } else if (modifyResult === 0) {
        // 替换无extends配置的情况
        const addExtendsResult = fileUtil.syncModifyFile(
          eslintRcPath,
          /(?<=module.exports[\s]?=[\s]?{)/,
          `
          extends: ${JSON.stringify(eslintConfigPath)},
          `,
          "utf-8"
        );
        if (addExtendsResult === 1) {
          Logger.info(chalk.green("eslintrc.js 配置文件更新完成"));
        } else {
          Logger.info(
            chalk.red("eslintrc.js 配置文件更新失败，请查看具体的错误信息")
          );
          throw new Error("fail to update eslintrc.js");
        }
      } else {
        Logger.info(
          chalk.red("eslintrc.js 配置文件更新失败，请查看具体的错误信息")
        );
        throw new Error("fail to update eslintrc.js");
      }
    }
  } else {
    if (filterJs.length) {
      // 存在 .eslintrc.js  其他配置文件，该配置方式已被废弃，升级到 .eslintrc.js 的配置方式
      const choice = await runPrompts<{ eslint: boolean }>({
        type: "toggle",
        name: "eslint",
        message: `检查到已废弃的配置方式 ${filterJs.join(
          "\n"
        )}, 是否升级为 .eslintrc.js, 原有配置会被迁移(Y/n)`,
      });
      if (choice.eslint) {
        let newFileContent = "";
        for (const oldFile of filterJs) {
          const eslintRcOld = `${process.cwd()}/${oldFile}`;
          const fileContent = fs.readFileSync(oldFile, "utf-8");
          const fileJSON = JSON.parse(fileContent);
          const newFileJSON = assign(
            {
              extends: eslintConfigPath,
            },
            fileJSON
          );
          if (newFileJSON && newFileJSON.rules) {
            const choiceToDeleteOldRules = await runPrompts<{
              eslint: boolean;
            }>({
              type: "confirm",
              name: "eslint",
              message: "检测到存在已有的 eslint 规则，是否保留Y/n?",
            });
            if (!choiceToDeleteOldRules.eslint) {
              delete newFileJSON.rules;
            }
          }
          newFileContent += ` ${JSON.stringify(newFileJSON, null, 2)};\n`;

          fs.unlinkSync(eslintRcOld);
        }
        fs.writeFileSync(eslintRcPath, `module.exports = ${newFileContent}`);
        Logger.info(
          chalk.green("eslint 配置升级并更新完成，please check for sure")
        );
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
      Logger.info(chalk.green("eslint配置完成"));
      Logger.info(
        chalk.yellow(
          "如果该项目中已经存在 eslintrc.js 之外的其他eslint配置文件，可以删除~"
        )
      );
    }
  }
}

export default configEslintRC;
