export default (options: any, ctx: any) => {
  const { pages } = ctx;

  return {
    name: '@fire/internal-page-components',

    async clientDynamicModules() {
      //@ts-ignore
      const code = `export default {\n${pages
        //@ts-ignore
        .filter(({ _filePath }) => _filePath)
        .map(
          //@ts-ignore
          ({ key, _filePath }) =>
            `  ${JSON.stringify(key)}: () => import(${JSON.stringify(_filePath)})`
        )
        .join(',\n')} \n}`;
      return { name: 'page-components.js', content: code, dirname: 'internal' };
    }
  };
};
