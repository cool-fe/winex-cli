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
};

export interface PkgOptions {
  local: string;
  remote: string;
};

export interface CommandsOptions {
  pm: string;
  plugin?: string;
}

export interface EmojiOptions {
  pending: string;
  cancelled: string;
  submitted: string;
}
