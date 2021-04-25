---
home: true
title: trn-cli

hero:
  title: trn-cli
  desc: 快速创建构建项目，项目管理一触即达。

features:
  - title: 开箱即用
    desc: 重点关注项目声明周期管理，帮助开发者零成本创建项目，让所有注意力都放在业务开发上
    icon: https://gw.alipayobjects.com/zos/bmw-prod/881dc458-f20b-407b-947a-95104b5ec82b/k79dm8ih_w144_h144.png

  - title: 功能丰富
    desc: 内置多套模版, 可跨端选择项目模版，区块、组件等物料。丰富的脚手架交互体验，一次性创建你想要的项目框架，让项目开发更加顺手
    icon: https://gw.alipayobjects.com/zos/basement_prod/a1c647aa-a410-4024-8414-c9837709cb43/k7787itw_w126_h114.png

  - title: 面向未来
    desc: 在满足需求的同时，我们也不会停止对新技术的探索，沉淀项目开发最佳实践，开发满足不同开发场景的物料，模版，区块，组件等等。
    icon: https://gw.alipayobjects.com/zos/basement_prod/d078a5a9-1cb3-4352-9f05-505c2e98bc95/k7788v4b_w102_h126.png

footer: Copyright © 2021-present<br />Powered by 潭州教育
---

## 关于

搭建一套自动化的项目创建工具，目标是管控项目整个声明周期

### Commands：

- [`trn create`](http://frontend.tanzk.cn/tools/trn-cli/#/create)
- [`trn gitlab`](http://frontend.tanzk.cn/tools/trn-cli/#/gitlab)
- [`lerna block`](http://frontend.tanzk.cn/tools/trn-cli/#/blocks)

## 起步

- 安装：

```bash
$ npm install -g @tzfe/trn-cli --registry=http://nexus.tanzk.com:8081/repository/tzedu_npm_public/
# OR
$ yarn config set registry http://nexus.tanzk.com:8081/repository/tzedu_npm_public/
$ yarn global add @tzfe/trn-cli
```

- 创建一个项目：

```bash
$ t create  -d my-project
# OR
$ trn create  -d my-project
```

## 反馈

|                               Gitlab Issue                                |                                                        企业微信                                                         |
| :-----------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: |
| [前端组/tools/trn-cli](http://git.tanzk.cn/frontend/tools/trn-cli/issues) | <img src="https://res.shiguangkey.com/homework/2021/1/14/0c8f16efa0/16106114750744299.jpg" width="216"  height="310" /> |
