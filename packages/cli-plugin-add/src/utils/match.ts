import chalk from 'chalk';

export function match(text: string) {
  const pluginRe = /^(@?[^@]+)(?:@(.+))?$/;
  let match: RegExpMatchArray | null = text.match(pluginRe);

  if (match) {
    const [
      _skip,
      pluginName,
      pluginVersion
    ] = match;

    return {
      pluginName,
      pluginVersion
    };
  } else {
    throw new Error(
      `Couldn't find any versions for ${chalk.cyan(text)}`
    ); // case: component@
  }
}
