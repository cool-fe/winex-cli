import Config from 'webpack-chain'

module.exports = (() => {
  // 对该单一构造函数创建一个新的配置实例
  const config = new Config();
  const inlineLimit = 10000;

  const vueMajor = 2; //目前主要都是vue2.x，目前先写死
  const supportsEsModuleAsset = vueMajor !== 2;

  const genAssetSubPath = (dir: string) => {
    return `${dir}/[name].[hash:8].[ext]`;
  };

  const genUrlLoaderOptions = (dir: string) => {
    return {
      limit: inlineLimit,
      esModule: supportsEsModuleAsset,
      // use explicit fallback to avoid regression in url-loader>=1.1.0
      fallback: {
        loader: require.resolve("file-loader"),
        options: {
          name: genAssetSubPath(dir),
          esModule: supportsEsModuleAsset,
        },
      },
    };
  };

  config.module
    .rule("images")
    .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
    .use("url-loader")
    .loader(require.resolve("url-loader"))
    .options(genUrlLoaderOptions("img"));
  config.module
    .rule("svg")
    .test(/\.(svg)(\?.*)?$/)
    .use("file-loader")
    .loader(require.resolve("url-loader"))
    .options({
      limit: inlineLimit,
      esModule: supportsEsModuleAsset,
      fallback: {
        loader: require.resolve("file-loader"),
        options: {
          name: genAssetSubPath("img"),
          esModule: supportsEsModuleAsset,
        },
      },
    });

  config.module
    .rule("media")
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use("url-loader")
    .loader(require.resolve("url-loader"))
    .options(genUrlLoaderOptions("media"));

  config.module
    .rule("fonts")
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use("url-loader")
    .loader(require.resolve("url-loader"))
    .options(genUrlLoaderOptions("fonts"));
  // return config.toConfig().module?.rules
  return config
});