export interface AddOptions {
  pluginName: string, // full name of the package to get
  pluginVersion?: string, // the package of version
  pm?: string,
  tarball?: string, // dist
  registry?: string,
  core?: string[], // core files
  remote?: object,
  context?: string,
};

export interface GetMaterialOptions {
  npm?: string, // full name of the package to get
  type?: string, // npm / code
  registry?: string,
  tarball?: string,
  core?: string[],
  dependencies?: object,
};

export interface PkgOptions {
  local: string,
  remote: string,
};

export interface CommandsOptions {
  pm: string;
}
