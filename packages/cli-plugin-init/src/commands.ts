export default {
  init: {
    usage: "init project",
    lifecycleEvents: ["init"],
    options: {
      "--name, -n <app-name>": {
        usage: "create a new project by winex-cli",
        shortcut: "n",
      },
      "--type [project-type]": {
        usage: "choose project type",
        config: {
          default: "normal",
        },
      },
      "--domain [project-domain]": {
        usage: "choose project domain",
        config: {
          default: "common",
        },
      },
      "--qiankun, -qk [type]": {
        usage: "choose qiankun type",
        shortcut: "qk",
        config: {
          default: "normal",
        },
      },
      "--template, -t [package-name]": {
        usage: "init a project from npm",
        shortcut: "t",
      },
      "--repository, -r [url]": {
        usage: "use specified git repository",
        shortcut: "r",
      },
      "--registry, -r [url]": {
        usage:
          "use specified npm registry when installing dependencies(only for npm)",
        shortcut: "r",
      },
      "--packageManager, -pm [command]": {
        usage: "use specified npm client when installing dependencies",
        shortcut: "pm",
        config: {
          default: "yarn",
        },
      },
      "--path [path]": {
        usage: "use specified  absolute path",
      },
    },
  },
};
