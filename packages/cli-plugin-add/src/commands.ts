export type CommandsType = 'pm' | 'plugin';

const COMMANDS_CONSTANT: {
  [key in CommandsType]: string
} = {
  pm: 'yarn',
  plugin: '',
};

const commands = {
  add: {
    usage: "install a plugin or block in an already created project",
    lifecycleEvents: ['add'],
    options: {
      "--plugin <plugin>": {
        usage: "Specify a plugin or block name",
        shortcut: "p",
      },
      "--pm [pm]": {
        usage: "Specify a management tool",
        shortcut: "pm",
        config: {
          default: COMMANDS_CONSTANT['pm'],
        },
      },
    },
  },
};

export {
  commands,
};
