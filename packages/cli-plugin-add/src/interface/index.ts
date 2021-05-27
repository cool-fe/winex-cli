export interface CommonParams {
  [key: string]: string;
}

export interface AddOptions {
  pluginName: string; // full name of the package to get
  pm: string;
  tarball: string; // dist
  registry: string;
  pluginVersion: string; // the package of version
  core: string[]; // core files
  remoteDeps: CommonParams;
};

export interface GetMaterialOptions {
  npm: string; // full name of the package to get
  type: string; // npm / code
  registry: string;
  tarball: string;
  core: string[];
  dependencies: CommonParams;
  version: string;
};

export interface PkgOptions {
  local: string;
  remote: string;
};
