module.exports = {
  proxy: {
    '/inpatient-encounter/': {
      target: 'http://172.16.6.201'
    }
  },
  chainWebpack: (config) => {
    // console.log(config.toConfig().resolve);
  }
};
