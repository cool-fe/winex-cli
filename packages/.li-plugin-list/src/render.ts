import Table from "tty-table";
import chalk from "chalk";

interface Template {
  client: string;
  site: string;
  name?: string;
  description: string;
  document?: string;
}

export interface Sources {
  type: string;
  client: string;
  site: string;
  unpkgHost?: string;
  registry: string;
  name: string;
  description: string;
  homepage: string;
  author: string;
  blocks: [];
  components: [];
  scaffolds: [];
  pages: [];
}

// 根据终端类型排序
function _sort(data: Template[], key: string = "client") {
  data.sort((a: Template, b: Template) => {
    if (a[key] > b[key]) return 1;
    else if (a[key] < b[key]) return -1;
    return 0;
  });
}
// 渲染列表
function _renderList(data: Template[], title: string) {
  _sort(data); // 根据终端类型排序
  const common = {
    headerColor: "green",
    width: "auto",
    formatter: (value: string) => value,
  };
  const headers = [
    { alias: "终端", value: "client", ...common },
    { alias: "业务类型", value: "site", ...common },
    { alias: "框架", value: "type", ...common },
    { alias: "包名", value: "package", align: "left", ...common },
    { alias: "版本号", value: "version", ...common },
    { alias: "简介", value: "description", align: "left", ...common },
    { alias: "文档地址", value: "document", align: "left", ...common },
  ];
  const _title = chalk.bold.blue(title);
  const tableStr = Table(headers, data, {}).render();
  console.log(`  ${_title}${tableStr}\n`);
}

// 获取列表行信息
function _lineItem(item: any) {
  const { client, type, framework, site, source, description, document } = item;
  const sitesMap = {
    bu: "b端业务",
    cu: "c端业务",
  };
  const template = {
    client,
    type: type || framework,
    package: source.npm,
    version: source.version,
    site: sitesMap[site],
    description,
    document: document || "",
  };
  return template;
}

// 渲染数据
export function render(datas: Sources[]) {
  const templates: Template[] = [];
  const blocks: Template[] = [];
  const pages: Template[] = [];
  const components: Template[] = [];
  datas.forEach(({ client, site, ...rest }) => {
    const fields = { client, site };
    rest.scaffolds.forEach((item: any) => {
      templates.push(_lineItem(Object.assign(item, fields)));
    });
    rest.blocks.forEach((item: any) => {
      blocks.push(_lineItem(Object.assign(item, fields)));
    });
    rest.pages.forEach((item: any) => {
      pages.push(_lineItem(Object.assign(item, fields)));
    });
    rest.components.forEach((item: any) => {
      components.push(_lineItem(Object.assign(item, fields)));
    });
  });
  // 模板列表
  templates.length && _renderList(templates, `项目模板:`);
  // 区块列表
  blocks.length && _renderList(blocks, `区块列表:`);
  // 页面列表
  pages.length && _renderList(pages, `页面列表:`);
  // 组件列表
  components.length && _renderList(components, `组件列表:`);
}
