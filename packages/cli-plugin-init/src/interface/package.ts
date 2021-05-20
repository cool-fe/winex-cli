export interface GotOptions {
  version: string;
  registryUrl: string;
}

export interface IPackageBaseInfo {
  name: string;
  version: string;
  registry?: string;
}

export interface IAddPackageOptions {
  dev?: boolean;
}

export interface IScaffoldSource {
  type: string;
  npm: string;
  version: string;
  registry: string;
}

export interface IScaffolds {
  name: string;
  source: IScaffoldSource;
  type: string;
}

type MaterialKey =
  | "common"
  | "clinical"
  | "execution"
  | "finance"
  | "knowledge"
  | "record"
  | "person";

export interface IMaterialsInfo {
  name: string;
  key: MaterialKey;
  description: string;
  components: any[];
  blocks: any[];
  pages: any[];
  scaffolds: IScaffolds[];
  registry: string;
  unpkgHost: string;
  author: string;
}
