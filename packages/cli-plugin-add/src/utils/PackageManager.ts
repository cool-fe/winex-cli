import { executeCommand } from "./executeCommand";

const PACKAGE_MANAGER_CONFIG = {
  npm: {
    install: ["install", "--loglevel", "error"],
    add: ["install", "--loglevel", "error"],
    remove: ["uninstall", "--loglevel", "error"],
  },
  yarn: {
    install: [],
    add: ["add"],
    remove: ["remove"],
  },
};

export interface IAddPackageOptions {
  dev?: boolean;
}

class PackageManager {
  registry: string
  context: string;
  command: string;

  constructor(context: string, pm: string, registry: string) {
    this.context = context;
    this.command = pm;
    this.registry = registry;
  }

  // setRegistry() {}

  async runCommand(command: string, args?: string[]) {
    const _args = [
      ...PACKAGE_MANAGER_CONFIG[this.command][command],
      ...(args || []),
    ];

    if (this.registry) {
      _args?.push(...["--registry", this.registry]);
    }
    await executeCommand(this.command, _args, this.context);
  }

  async install(args?: string[]) {
    return await this.runCommand("install", args);
  }

  async add(pkg: string | string[], opts?: IAddPackageOptions) {
    const args = opts && opts.dev ? ["-D"] : [];
    const packages = Array.isArray(pkg) ? pkg : [pkg];

    return await this.runCommand("add", [...packages, ...args]);
  }

  async remove(pkg: string | string[]) {
    const packages = Array.isArray(pkg) ? pkg : [pkg];

    return await this.runCommand("remove", [...packages]);
  }
}

module.exports = PackageManager;
