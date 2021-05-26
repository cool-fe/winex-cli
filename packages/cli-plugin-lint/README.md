#winex lint

> 一键式处理项目的各种config，例如eslint、prettier、editorconfig、.vscode、husky、lint-staged。

## Usage

```bash
# 在项目根目录执行初始化lint或者升级lint
$ winex lint
```

当你运行如上命令的时候,大概做了如下几件事情:

- 会展示标准应用的项目模版供大家选择，您可以选择你想要的模版创建项目
- 初始化 git，同时创建 gitlab 仓库进行关联
- 设置项目的负责人权限：Maintainer

## Options

`trn create` 支持 [`trn gitlab`](#/gitlab) 所有参数

- [`--env`](#--env)
- [`--typescript`](#--typescript)
- [`--pm`](#--pm)
- [`--hook-engine`](#--hook-engine)
- [`--ci`](#--ci)

### `--env [browser]`

设置项目运行的环境

```bash
$ winex lint --env browser
```

### `--typescript`

项目是否支持ts

```bash
$ winex lint --typescript
```

### `--hook-engine [engine]`

设置git hook的工具,目前只支持husky,该参数目前还不支持


### `--pm [pm]`

设置项目包管理器，默认值 `yarn`，建议和您项目使用的包管理器保持一致

```bash
$ winex lint --pm yarn
```


### `--ci`

是否运行在ci/cd环境，一般做自动化ci/cd的时候可以在脚本中设置该参数，会跳过询问环节。不会询问env、typescript参数，都取默认值或者参数，对于没有默认值的参数请在执行脚本的时候传参

```bash
# 将不会询问env、typescript参数，都取默认值或者参数
$ winex lint --pm yarn  --ci
```
