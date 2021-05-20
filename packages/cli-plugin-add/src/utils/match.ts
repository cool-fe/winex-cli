import chalk from 'chalk';

export function match(text: string) {
  let data;
  const pluginRe = /^(@?[^@]+)(?:@(.+))?$/;

  try {
    const match: RegExpMatchArray | null = text.match(pluginRe);
    if (match) {
      const [
        _skip,
        pluginName,
        pluginVersion
      ] = match;

      data = {
        pluginName,
        pluginVersion
      };
    } else {
      throw new Error(`Couldn't find any versions for ${chalk.cyan(text)}`); // component@
    }
  } catch (error) {
    throw error;
  }

  return data;
}
