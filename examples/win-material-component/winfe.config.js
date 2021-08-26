module.exports = {
  proxy: {
    '/inpatient-encounter/': {
      target: 'http://172.16.6.201'
    }
  },
  sass: {},
  chainWebpack: (config) => {
    // const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
    // config.plugin('compressionWebpackplugin').use(require.resolve('compression-webpack-plugin'), [
    //   {
    //     filename: '[path].gz[query]',
    //     algorithm: 'gzip',
    //     test: productionGzipExtensions,
    //     threshold: 10240,
    //     minRatio: 0.8
    //   }
    // ]);

    config.merge({ devtool: 'source-map' });
    config.optimization.minimize(false);

    // console.log(
    //   'config.resolve.modules',
    //   config.module.rule('js').toConfig().use[0].options.presets
    // );
    return config;
  }
};
