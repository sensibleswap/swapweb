import { defineConfig } from 'umi';
import routes from './config/routes';

export default defineConfig({
  history: {
    type: 'hash',
  },
  nodeModulesTransform: {
    type: 'none',
  },
  favicon: '/assets/ts.png',
  title: 'TokenSwap - AMM DEX running on BSV',
  routes,
  fastRefresh: {},
  cssModulesTypescriptLoader: {},
  alias: {
    lib: '@/lib',
    i18n: '@/i18n',
    components: '@/components',
    common: '@/common',
    api: '@/api',
  },
  // proxy: {
  //     context: ['/allpairs', '/swapinfo', '/reqswapargs', '/token1totoken2', '/token2totoken1', '/addliq', '/removeliq'],
  //     target: 'https://api.tswap.io',
  // },
  copy: [
    {
      from: 'public/assets/',
      to: 'assets/',
    },
  ],
  links: [
    {
      // Google fonts hosting supported in China
      // Website: http://googlefonts.cn/
      // Add other font styles by choosing font styles on the official site.
      // Only normal, semi-bold and bold selected at the current stage
      href: 'https://fonts.font.im/css?family=Roboto:400,500,700',
      rel: 'stylesheet',
    },
  ],
  // chunks: ['vendors', 'umi', 'react'],
  // chainWebpack: function (config, { webpack }) {
  //   config.merge({
  //     optimization: {
  //       splitChunks: {
  //         chunks: 'all',
  //         minSize: 30000,
  //         minChunks: 3,
  //         automaticNameDelimiter: '.',
  //         cacheGroups: {

  //           // voltsdk: {
  //           //   name: "voltsdk",
  //           //   test: /[\\/]node_modules[\\/](voltsdk)[\\/]/,
  //           //   priority: 10,
  //           //   enforce: true,
  //           // },
  //           umi: {
  //             name: "umi",
  //             test: /[\\/]node_modules[\\/](umi)[\\/]/,
  //             priority: 10,
  //             enforce: true,
  //           },
  //           // echarts: {
  //           //   name: "echarts",
  //           //   test: /[\\/]node_modules[\\/](echarts)[\\/]/,
  //           //   priority: 10,
  //           //   enforce: true,
  //           // },
  //           react: {
  //             name: "react",
  //             test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
  //             priority: 10,
  //             enforce: true,
  //           },
  //           vendors: {
  //             name: "vendors",
  //             test: /[\\/]node_modules[\\/](?!voltsdk|umi|echarts|msgpack5|react|react-dom).*$/,
  //             priority: 11,
  //             enforce: true,
  //           },
  //         },
  //       },
  //     }
  //   });
  // },
});
