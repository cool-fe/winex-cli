# @winfe/cli-plugin-add

在现有的项目中安装物料，请参考[技术方案文档](https://www.yuque.com/srmcc5/hrthg3/an7gty)

## 设计意图

根据[物料的技术方案](https://www.yuque.com/srmcc5/hrthg3/gtelg2)可以看到，目前把物料分为业务组件、区块和页面，使用的形式也不相同，且物料信息由 `@winfe/get-materials` 提供，所以 `winex-cli` 提供了 `add` 命令来帮助开发者安装和使用物料。

关于物料的详细信息，请参考[物料开发模板](https://www.yuque.com/srmcc5/hrthg3/ubex9y)

## 开始

```bash
$ winex add --plugin <plugin> --pm [pm]
```

#### 业务组件

```bash
$ winex add --plugin components-name
```
1.从 `@winfe/get-materials` 查找，获取元数据

2.执行 `npm/cnpm/yarn install components-name -save`

#### 区块、页面

```bash
$ winex add --plugin block-name
```
1.从 `@winfe/get-materials` 查找，获取元数据

2.确定区块或者页面的存放路径

3.是否需要安装区块或者页面所依赖的 `dependencies`

如果安装的依赖检测到跟现有的项目依赖有主版本的差异，则会给出提示信息，如图：

## 参数
| 选项名称（option） | 缩写 | 选项说明 |  可选值 |
|---------- |-------- |-------- |-------- |
| --plugin | -p | 物料包名称 | - |
|--pm |	-pm	| 设置node包管理工具 |	yarn(默认)/npm/cnpm|
