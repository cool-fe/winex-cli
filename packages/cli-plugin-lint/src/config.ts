export interface DepConfig {
  [key: string]: string;
}

interface ProjectDepConfig {
  [index: string]: DepConfig;
}

export const commonDeps: DepConfig = {
  eslint: "7.25.0",
  "@babel/eslint-parser": "7.13.14",
};

export const tsDeps: DepConfig = {
  "@typescript-eslint/parser": "4.22.1",
  "@typescript-eslint/eslint-plugin": "4.22.1",
};

export const configDeps: ProjectDepConfig = {
  default: {
    "eslint-config-airbnb-base": "14.2.1",
    "eslint-plugin-import": "2.22.1",
  },
};

export const pluginDeps: ProjectDepConfig = {
  vue: {
    "eslint-plugin-vue": "7.9.0",
    "eslint-plugin-html": "6.1.2",
  },
  node: {
    "eslint-plugin-node": "11.1.0",
  },
};

export const DeafultSharedEslintConfig: DepConfig = {
  "@winfe/eslint-config-winex": "0.0.2",
};

export const winfeCiDeps: DepConfig = {};

export const huskyCiDeps: DepConfig = {
  husky: "6.0.0",
  "lint-staged": "11.0.0",
  yorkie: "2.0.0",
};
