export const commandLineUsage: any = (options: {
  map: (arg0: any) => any[];
  header: string;
  content: any;
  optionList: any[];
}) => {
  if (Array.isArray(options)) {
    return options.map(commandLineUsage).join("\n");
  }
  const result = ["\n"];
  if (options.header) {
    result.push(
      options.header.replace(/^./, (match: string) => match.toUpperCase())
    );

    if (options.content) {
      result.push(`  ${options.content}`);
    }
    result[result.length - 1] = result[result.length - 1] + "\n";
  }
  const optionsList: { option: string; info: any }[] = [];
  let length = 0;
  if (options.optionList) {
    options.optionList.map(
      (info: { alias: any; name: any; description: any }) => {
        const option = `  ${info.alias ? `-${info.alias}, ` : ""}--${
          info.name
        }`;
        if (option.length > length) {
          length = option.length + 4;
        }
        optionsList.push({
          option,
          info: info.description || "",
        });
      }
    );
  }
  optionsList.forEach((options) => {
    result.push(options.option.padEnd(length, " ") + options.info + "\n");
  });
  return result.join("\n");
};
