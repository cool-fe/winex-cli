import chalk from "chalk";
import {
  IScaffoldInfo,
  IMaterialsInfo,
  IMaterialSource,
  IPackageBaseInfo,
} from "../interface/index";

import { getNpmPkg } from "./getNpmPkg";

import { GROUP_NAME_PREFIX, REGISTRIES } from "../constants/index";

import validatePkgName from "validate-npm-package-name";

const { getMaterialListAsync } = require("@winfe/get-materials");

/**
 * 获取物料统计信息数据
 * @returns 所有物料数据
 */
export async function getMaterialsInfo(): Promise<IMaterialsInfo[]> {
  try {
    const data = await getMaterialListAsync();

    return data || [];
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * 获取全部模板 npm package name或相关域的模板
 * @param {String} domain 项目所属域
 * @param {String} category 项目类型(app_indep, app_main, app_sub)
 * @returns 全部满足条件的模板数据
 */
export async function getWinningScaffolds(
  domain?: string,
  category?: string,
  materials?: IMaterialsInfo[]
): Promise<IScaffoldInfo[]> {
  try {
    const allMaterilas = materials || (await getMaterialsInfo());

    // 根据项目类型 筛选相应的模板
    const gatherScaffolds = (
      materilas: IMaterialsInfo[],
      category?: string
    ) => {
      const list = materilas.reduce(
        (acc: IScaffoldInfo[], cur: IMaterialsInfo) =>
          acc.concat(...cur.scaffolds),
        []
      );

      // 无需qiankun类型筛选时
      if (!category) return list;

      return list.filter((item: IScaffoldInfo) =>
        item.category.includes(category)
      );
    };

    const filtered = domain
      ? allMaterilas.filter(({ key }) => key.includes(domain))
      : allMaterilas;

    return gatherScaffolds(filtered, category);
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * 是否为winning仓库的模板包
 * @param name npm包的name
 * @returns 目标模板包信息 | undefined
 */
export async function isWinningNpm(
  name: string
): Promise<IMaterialSource | undefined> {
  const packages: IScaffoldInfo[] = await getWinningScaffolds();

  return packages.map(({ source }) => source).find((item) => item.npm === name);
}

/**
 * 检测项目模板的包名
 * 1. 是否符合npm包的命名规范
 * 2. 是否为卫宁预置项目模板名称
 * @param pkgName 包名
 * @returns 包名是否合法
 */
export async function checkPakcageName(pkgName: string): Promise<Boolean> {
  const isWinningPkg = async () => {
    const { name, version } = genNpmInfo(pkgName);
    const validPkg = await isWinningNpm(name);

    if (validPkg) {
      return getNpmTarballUrl({
        name,
        version,
        registry: validPkg.registry,
      });
    }
  };
  const validName = validatePkgName(pkgName);

  return Boolean(validName && (await isWinningPkg()));
}

/**
 * 获取npm包的基本信息, 包括name、version等
 * @param pkgName 包名称
 * @returns npm包的基本信息
 */
export function genNpmInfo(pkgName: string): IPackageBaseInfo {
  let versionIndex = pkgName.replace(GROUP_NAME_PREFIX, "").lastIndexOf("@");

  if (versionIndex < 1) {
    return {
      name: pkgName,
      version: "latest",
    };
  }

  if (pkgName.includes(GROUP_NAME_PREFIX)) {
    const prefixLen = GROUP_NAME_PREFIX.length;
    versionIndex += prefixLen;
  }

  return {
    name: pkgName.slice(0, versionIndex),
    version: pkgName.slice(versionIndex + 1) || "latest",
  };
}

/**
 * 获取npm包的压缩包地址
 * @param options 包的信息内容
 * @returns 压缩包地址
 */
export async function getNpmTarballUrl(options: IPackageBaseInfo) {
  try {
    let { name, version, registry } = options;

    registry = registry || (await getNpmRegistry(name));

    return await getNpmPkg(name, {
      registryUrl: registry,
      version: version || "latest",
    });
  } catch (e) {
    const { version, name } = options;

    console.error(
      `${chalk.red(
        `✖  Package ${name}${version ? `@${version}` : ""} could not be found.`
      )}`
    );
    process.exit(1);
  }
}

/**
 * 获取npm源
 * 1. 配置了环境参数, 则返回环境参数registry
 * 2. 为卫宁的npm包则返回包内容的source.registry, 否则返回固定卫宁仓库域名
 * 3. 否则返回淘宝npm镜像
 * @param pkgName
 * @returns 镜像地址
 */
async function getNpmRegistry(pkgName: string): Promise<string> {
  if (process.env.REGISTRY) return process.env.REGISTRY;

  const WINNING_PKG = await isWinningNpm(pkgName);

  if (WINNING_PKG) return WINNING_PKG.registry || REGISTRIES.winning;

  return REGISTRIES.taobao;
}
