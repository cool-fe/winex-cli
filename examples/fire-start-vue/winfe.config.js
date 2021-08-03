module.exports = {
  chainWebpack: (config) => {
    // console.log(config.module.rule('svg'), 'ssss');
    // config.module
    //   .rule('images')
    //   .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
    //   .use('url-loader')
    //   .loader(require.resolve('url-loader'))
    //   .options({
    //     limit: 10000,
    //     esModule: false,
    //     fallback: {
    //       loader: require.resolve('file-loader'),
    //       options: {
    //         name: `img/[name].[hash:8].[ext]`,
    //         esModule: false
    //       }
    //     }
    //   });
    // config.module
    //   .rule('svg')
    //   .test(/\.(svg)(\?.*)?$/)
    //   .use('file-loader')
    //   .loader(require.resolve('url-loader'))
    //   .tap((options) => {
    //     Object.assign(options, {
    //       limit: 4096
    //     });
    //   });
  }
};
