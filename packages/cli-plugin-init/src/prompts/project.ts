import { getWinningScaffolds, getMaterialsInfo } from "../utils/package";
import { PROJECT_TYPE, BUSINESS_TYPE } from "../constants/index";

import { IScaffoldInfo, IMaterialsInfo, IChoice } from "../interface/index";

const chalk = require("chalk");
const { Select, AutoComplete, Input, Toggle } = require("enquirer");

/**
 * 格式化选项(选项后跟中文注解, 辅助选择)
 * @param choices 选项数据
 * @returns 格式化后的选项数据
 */
function normalizeChoices(choices: IChoice[]) {
  return choices.map(({ name, desc }) => ({
    name: `${name}${chalk.gray(`(${desc})`)}`,
    value: name,
  }));
}

async function domainPrompts(domains: IMaterialsInfo[]) {
  const _prompt = new Select({
    name: "domain",
    message: "Which domain does the project belong to",
    choices: normalizeChoices(
      domains.map(({ name, key }) => ({
        name: key,
        desc: name,
      }))
    ),
    result(name: string) {
      return this.map(name)[name];
    },
  });

  return await _prompt.run();
}

/**
 * 项目类型相关的问询
 * 选择项目类型(一般业务项目、脚手架插件项目、物料项目等...)
 * @returns 项目类型
 */
async function projectTypePrompts() {
  const _prompt = new Select({
    name: "type",
    message: "Project type",
    choices: normalizeChoices(PROJECT_TYPE),
    result(name: string) {
      return this.map(name)[name];
    },
  });

  return await _prompt.run();
}

async function qiankunPrompts() {
  const _prompt = new Select({
    name: "qiankun",
    message: "Business type of project",
    choices: normalizeChoices(BUSINESS_TYPE),
    result(name: string) {
      return this.map(name)[name];
    },
  });

  return await _prompt.run();
}

/**
 * 模板类型相关的问询
 * @param domain 域
 * @param qiankunType 业务类型
 */
async function scaffoldPrompts(
  domain: string,
  qiankunType: string,
  materails: IMaterialsInfo[]
) {
  let choices: IScaffoldInfo[] = [];

  choices = await getWinningScaffolds(domain, qiankunType, materails);

  // 未筛选到任何模板列表
  if (!choices.length) {
    console.error(
      `${chalk.red(
        `✖  No matching scaffold was found in the ${chalk.cyan(
          `${domain}/${qiankunType}`
        )} branch.`
      )}`
    );
    process.exit(1);
  }

  const _prompt = new AutoComplete({
    name: "template",
    message: "Pick a preset scaffold",
    limit: 10,
    choices: choices.map(({ name, source }) => {
      return {
        name,
        value: source.npm,
      };
    }),
    result(name: string) {
      return this.map(name)[name];
    },
  });

  return _prompt.run();
}

/**
 * 关于仓库信息有关的问询
 */
async function repositoryPrompts() {
  // 是否需要初始化仓库
  const _prompt = new Toggle({
    message: "Need to initialize the repository",
    enabled: "Yes",
    disabled: "No",
  });

  const result = await _prompt.run();

  if (result) {
    // 请输入仓库的git地址
    const _prompt = new Input({
      type: "input",
      name: "repository",
      message: "Input the git repository",
      required: true,
    });

    return _prompt.run();
  } else {
    return "";
  }
}

/**
 * 处理一般业务项目的问询
 * 一般业务项目(询问所属域、业务项目类型、选择模板)
 * @returns
 */
async function normalTypeHandler() {
  try {
    // 所属域
    const materials = await getMaterialsInfo();
    const domain = await domainPrompts(materials);

    // 乾坤类型(一般业务、主应用、子应用)
    const qiankunType = await qiankunPrompts();

    // 业务项目模板名称
    const template = await scaffoldPrompts(domain, qiankunType, materials);

    // 仓库地址(允许为空)
    const repository = await repositoryPrompts();

    return {
      domain,
      qiankunType,
      template,
      repository,
    };
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * 处理待开发项目类型选择异常处理
 */
function toBeDeveloped() {
  console.error(`${chalk.red(`✖  This project type is to be developed.`)}`);
  process.exit(1);
}

/**
 * 开始询问初始化问题
 * @returns {Array} answers
 */
export async function runPrompts() {
  const projectType = await projectTypePrompts();

  const handlerMap = new Map();

  // 一般业务项目
  handlerMap.set("normal", normalTypeHandler);

  const handler = handlerMap.get(projectType);

  if (handler) {
    return handler();
  } else {
    toBeDeveloped();
  }
}
