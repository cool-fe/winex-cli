//@ts-ignore
import { Project } from '@lerna/project';
//@ts-ignore
import { PackageGraph } from '@lerna/package-graph';
//@ts-ignore
import { collectUpdates } from '@lerna/collect-updates';
import chalk from 'chalk';
import Logger from './logger';

type updatePacksge = {
  name: string;
  location: string;
  resolved: {
    [key: string]: string;
  };
}[];

type update = string[];

export async function collectMatiralUpdates(options = {}): Promise<[update, updatePacksge]> {
  // 安装相关依赖
  // const { package, registry, ci } = content?.parsedOptions?.options as PluginOptions;
  // if (ci) return;
  const project = new Project();
  const packageGraph = new PackageGraph(await project.getPackages());

  console.log('project.manifest', project.manifest);

  const execOpts = {
    cwd: project.rootPath
  };

  const updates = await collectUpdates(
    packageGraph.rawPackageList,
    packageGraph,
    execOpts,
    options
  );

  const filterUpdates = updates.filter((node: { version: string; name: string }) => {
    if (!node.version) {
      throw new Error(
        `ENOVERSION A version field is required in ${node.name}'s package.json file.
          If you wish to keep the package unversioned, it must be made private.`
      );
    }

    return !!node.version;
  });

  if (!updates.length) {
    Logger.info(`No changed packages to publish`);
    return [[], []];
  }

  const updatesVersions = new Map(
    filterUpdates.map((node: { name: string }) => [node.name, '1.0.0'])
  );

  const packagesToVersion = filterUpdates.map((node: { pkg: string }) => node.pkg);

  const changes = packagesToVersion.map(
    (pkg: { name: unknown; version: string; private: boolean }) => {
      let line = ` - ${pkg.name}: ${pkg.version} => ${updatesVersions.get(pkg.name)}`;
      if (pkg.private) {
        line += ` (${chalk.red('private')})`;
      }
      return line;
    }
  );

  return [changes, packagesToVersion];
}

collectMatiralUpdates();

export function packageName() {
  console.log(99);
}
