module.exports = {
  proxy: {
    '/inpatient-encounter/': {
      target: 'http://172.16.6.201'
    }
  },
  sass: {},
  chainWebpack: () => {
    // console.log(config.toConfig().resolve);
  }
};
