const pluginMaterial = require('@winfe/plugin-material-config');
const path = require('path');

const PROXY_APP_IP = 'http://172.16.7.60';
const MATERIAL_NAME = process.env.MATERIAL_NAME;

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  base: `/material-docs/${process.env.MATERIAL_CATEGORY}/${MATERIAL_NAME}/`, //部署站点基础路径
  title: process.env.MATERIAL_TITLE, // 网站标题
  description: '介绍关于前端物料的安装使用方法',
  head: [['link', { rel: 'stylesheet', href: 'http://172.16.7.58/web-public/base-ui/index.css' }]],
  plugins: ['demo-container', pluginMaterial.default],
  themeConfig: {
    nav: [
      // { text: '首页', link: 'https://cool-fe.github.io/winex-material-doc/' },
      {
        text: '开发物料',
        link: 'https://cool-fe.github.io/winex-material-doc/guides/'
      },
      {
        text: '使用物料',
        link: 'https://cool-fe.github.io/winex-material-doc/usage/'
      }
      // {
      //   text: '业务域',
      //   ariaLabel: '业务域',
      //   items: [
      //     {
      //       text: '公共仓库',
      //       link: 'http://172.16.6.214/webmaterials-common'
      //     },
      //     {
      //       text: '费用域',
      //       link: 'http://172.16.6.214/webmaterials-finance'
      //     },
      //     {
      //       text: '就诊域',
      //       link: 'http://172.16.6.214/webmaterials-encounter'
      //     },
      //     {
      //       text: '执行域',
      //       link: 'http://172.16.6.214/webmaterials-execution'
      //     },
      //     {
      //       text: '临床域',
      //       link: 'http://172.16.6.214/webmaterials-clinical'
      //     },
      //     {
      //       text: '物品域',
      //       link: 'http://172.16.6.214/webmaterials-material'
      //     },
      //     {
      //       text: '记录域',
      //       link: 'http://172.16.6.214/webmaterials-record'
      //     },
      //     {
      //       text: '患者域',
      //       link: 'http://172.16.6.214/webmaterials-person'
      //     }
      //   ]
      // }
    ],
    sidebar: [
      // {
      //   title: "使用教程",
      //   collapsable: false,
      //   children: ["/usage/getting-started"],
      // },
      // 危险勿动
      // {
      //   title: '业务组件',
      //   collapsable: false,
      //   $$key: 'components',
      //   children: []
      // },
      // 危险勿动
      // {
      //   title: '模板',
      //   collapsable: false,
      //   $$key: 'scaffolds',
      //   children: []
      // }
    ]
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'style-resources-loader',
              options: {
                patterns: [require.resolve('@winfe/theme-helper')]
              }
            }
          ]
        }
      ]
    }
  }
};
