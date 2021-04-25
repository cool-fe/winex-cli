export default {
  hash: true,
  title: "trn",
  logo:
    "https://frontend-static-cdn.shiguangkey.com/tz-common-logo/logo-middle.svg",
  mode: "site",
  publicPath: "./",
  history: { type: "hash" },
  resolve: {
    includes: ["./docs"],
    previewLangs: [],
  },
  locales: [["zh-CN", "中文"]],
  favicon:
    "https://frontend-static-cdn.shiguangkey.com/tz-common-logo/favicon.ico",
  menus: {},

  navs: [
    null,
    {
      title: "问题反馈",
      path: "http://git.tanzk.cn/frontend/tools/trn-cli/issues",
    },
  ],
  polyfill: false,
  extraBabelPlugins: [
    [
      "import",
      {
        libraryName: "antd",
        libraryDirectory: "es",
        style: "css",
      },
    ],
  ],
  exportStatic: {},
};
