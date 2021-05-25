# @winfe/cli-plugin-init

> Create a new project by winex-cli

## Usage

```bash
$ winex init --name <app-name>
```

## Options
| 选项名称（option） | 缩写 | 选项说明 |  可选值 |
|---------- |-------- |-------- |-------- |
| --name | -n | 项目名称（同outdir） | - |
| --type | -   | 初始化项目的类型(普通业务项目、插件项目、物料项目及其他) | normal(默认)、cli-plugin等 |
| --domain | -   | 选择业务项目所属域 | 见Domains表详情 |
|--qiankun |	-qk	|选择初始化业务项目时，需选择业务应用类型（主应用、子应用、普通）	|app-indep(默认)、app-main、app-sub|
|--template |	-t	|模板npm包名称|	-|
|--repository |	-r	|项目git仓库地址	|tfs/gitlab/github等git仓库地址|
|--registry |	-	|设置npm源 |	https://registry.npmjs.org/|
|--packageManager |	-pm	| 设置node包管理工具 |	yarn(默认)/npm/cnpm|
|--path |	-	 |项目存储地址(绝对地址)	|默认为当前运行路径|

## Domains
| 域 | 含义 |
|---------- |-------- |
| common | 公共仓库 |
| finance | 费用域 |
| clinical | 临床域 |
| execution | 执行域 |
| person | 患者域 |
| encouter | 就诊域 |
| record | 记录域 |
| knowledge | 知识域 |
| material | 物品域 |
