@winex/cli-plugin-lint


## winex lint

> 一键式处理项目的各种config，eslint、prettier、editorconfig、.vscode、husky、lint-staged

## 使用

```bash
# 指定项目目录名创建项目
$ winex lint
```

当你运行如上命令的时候,大概做了如下几件事情:

- 会展示标准应用的项目模版供大家选择，您可以选择你想要的模版创建项目
- 初始化 git，同时创建 gitlab 仓库进行关联
- 设置项目的负责人权限：Maintainer

## Options

`trn create` 支持 [`trn gitlab`](#/gitlab) 所有参数

- [`--out`](#--out-dir)
- [`--name`](#--name-name)
- [`--desc`](#--desc-desc)
- [`--pm`](#--pm-pm)
- [`--term-type`](#--term-type-pch5webapp)
- [`--bu-type`](#--bu-type-toctob)
- [`--template-name`](#--template-name-vue-nuxtuniappnuxt)
- [`--gitlab`](#--gitlab)
- [`--git-init`](#--git-init)
- [`--git-url`](#--git-url-url)
- [`--group-id`](#--group-id-group_id)
- [`--git-maintainer`](#--git-maintainer-maintainer)
- [`--yes`](#--yes)

### `--out [dir]`

你可以设置项目本地的目录名称

```bash
# 创建的项目文件目录名为project_name
$ trn create --out project_name
```

### `--name [name]`

你可以设置项目名称

```bash
# 创建的项目文件目录名为hello-word
$ trn create --name hello-word
```

### `--desc [desc]`

你可以设置项目描述

```bash
# 创建的项目文件目录名为hello-word
$ trn create --desc my first app
```

### `--pm [pm]`

你可以设置项目包管理器

```bash
# 创建的项目文件目录名为hello-word
$ trn create --pm yarn
```

### `--template-name [vue-nuxt@x.x.x|uniapp-nuxt@x.x.x]`

创建项目模版的物料包名：[比如](http://git.tanzk.cn/frontend/tzedu-lab/pc-customer/blob/master/scaffolds/vue-nuxt/package.json#L2)
可以指定版本号，如果不指定版本号则以最新版模版创建项目

```bash
# 创建toc的项目
$ trn create --template-name vue-nuxt
```

### `--term-type [pc|h5|miniProgram]`

创建的项目类型，你可以使用`pc`、`h5`、`miniProgram`创建不同终端类型的项目模版。**此项没有默认值** 如果设置了`--template-name`了，此项将无效

```bash
# 创建pc的项目
$ trn create --out project_name --term-type pc
```

### `--bu-type [cu|bu]`

创建项目的业务类型，你可以使用`cu`创建面向 c 端用户,使用`bu`创建 面向 b 端用户的项目模版 **此项没有默认值** 如果设置了`--template-name`了，此项将无效

```bash
# 创建toc的项目
$ trn create --out project_name --bu-type cu
```

### `--gitlab`

是否创建 gitlab 仓库

```bash
# 创建toc的项目
$ trn create --gitlab
```

### `--git-init`

是否初始化 git

```bash
# 创建toc的项目
$ trn create --git-init
```

### `--git-url [url]`

初始化 gitlab 的仓库地址

```bash
# 创建toc的项目
$ trn create --git-url http://git.tanzk.cn/frontend/tools/trn-cli.git
```

### `--group-id [group_id]`

创建 gitlab 仓库的 Group Id

```bash
# 创建toc的项目
$ trn create --group-id 116
```

### `--git-maintainer [maintainer]`

创建 gitlab 仓库的项目 maintainer

```bash
# 创建toc的项目
$ trn create --git-maintainer dashixiong
```

### `--yes`

将跳过所有提示询问，采用默认值创建项目。

--template-name 或者--bu-type 和--term-type 两者必传，--template-name 优先级大于--bu-type 和--term-type

```bash
# 创建toc的项目
$ trn create --out hello word  --yes
```
