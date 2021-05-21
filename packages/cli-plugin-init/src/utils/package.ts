import {
  IScaffoldInfo,
  IMaterialsInfo,
  IMaterialSource,
} from "../interface/index";

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
 * @param pkgName
 * @returns 目标模板包信息 | undefined
 */
export async function isWinningNpm(
  pkgName: string
): Promise<IMaterialSource | undefined> {
  const packages: IScaffoldInfo[] = await getWinningScaffolds();

  return packages
    .map(({ source }) => source)
    .find((item) => item.npm.includes(pkgName));
}

/**
 * 检测项目模板的包名
 * 1. 是否符合npm包的命名规范
 * 2. 是否为卫宁预置项目模板名称
 * @param pkgName 包名
 * @returns 包名是否合法
 */
export async function checkPakcageName(pkgName: string): Promise<Boolean> {
  const isWinning = await isWinningNpm(pkgName);
  const validName = validatePkgName(pkgName);

  return Boolean(validName && isWinning);
}
