module.exports = {
  proxy: {
    '/inpatient-encounter/': {
      target: 'http://172.16.6.201'
    }
  },
  sass: {},
  chainWebpack: (config) => {
    // console.log(config.toConfig().resolve);
    const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
    config.plugin('compressionWebpackplugin').use(require.resolve('compression-webpack-plugin'), [
      {
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
      }
    ]);
    return config;
  }
};
