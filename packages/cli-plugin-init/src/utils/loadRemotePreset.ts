import fs from "fs-extra";
import path from "path";
import ora from "ora";

import { sync as mkdirp } from "mkdirp";
import { REGISTRIES } from "../constants/index";
import { isWinningNpm } from "./package";
import { renameConfigFiles } from "./renameConfigFiles";
import { readDir } from "./file";

import { IMoveContent } from "../interface/file";
import { IPackageBaseInfo } from "../interface/package";
import { getNpmPkg } from "./getNpmPkg";

const download = require("download-package-tarball");

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

/**
 * 整理npm包原始结构, 将包内容拷贝到目标路径
 * @param oldPath 临时下载文件的路径
 * @param content 临时文件下的目录(拷贝内容至目标路径)
 * @param newPath 目标路径
 */
function updateDirStructure(arg: IMoveContent): void {
  const { oldPath, newPath, content } = arg;

  fs.moveSync(path.resolve(oldPath, content), newPath);
  fs.removeSync(path.resolve(oldPath));
}

/**
 * 格式化远程模板数据, 主要是目录结构与特殊配置文件处理
 * @param moveConfig 文件目录结构更新所需配置参数
 */
async function formatRemotePreset(moveConfig: IMoveContent): Promise<void> {
  try {
    const { oldPath, newPath, content } = moveConfig;

    // 调整文件结构
    updateDirStructure({
      oldPath,
      content,
      newPath,
    });

    // 修改部分特殊配置文件名称
    const files = await readDir(newPath);
    renameConfigFiles(newPath, files || []);
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * 获取npm包的压缩包地址
 * @param options 包的信息内容
 * @returns 压缩包地址
 */
async function getNpmTarballUrl(options: IPackageBaseInfo) {
  try {
    let { name, version, registry } = options;

    registry = registry || (await getNpmRegistry(name));

    return await getNpmPkg(name, {
      registryUrl: registry,
      version: version || "latest",
    });
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * 下载远程模板
 * ---------------------------------------------------------
 * 先下载到缓存文件夹路径, 再拷贝所需要到内容至目标文件路径context
 * @param name 模板名称
 * @param context 输出文件路径
 */
export const loadRemotePreset = async (
  options: IPackageBaseInfo,
  context: string
) => {
  return new Promise(async (resolve) => {
    const {
      dist: { tarball },
    } = await getNpmTarballUrl(options);

    try {
      // cache dir of package
      const tmpDir = `${context}_cache`;
      const { name } = options;

      // create cache dir
      mkdirp(tmpDir);

      // download tarball
      const spinner = ora(
        "Downloading remote preset scaffold tarball..."
      ).start();
      await download({ url: tarball, gotOpts: {}, dir: tmpDir });
      spinner.succeed("Download remote preset scaffold successfully.");

      // format file
      formatRemotePreset({
        oldPath: tmpDir,
        content: name,
        newPath: context,
      });

      resolve(true);
    } catch (e) {
      throw new Error(e);
    }
  });
};
