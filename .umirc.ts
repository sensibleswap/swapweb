import { defineConfig } from 'umi';
import routes from './config/routes';

export default {
  publicPath: './',
  history: {
    type: 'hash',
  },
  nodeModulesTransform: {
    type: 'none',
  },
  dva: {},
  favicon:
    'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb7915d15eedd93c90d91e0d76de5cc932c833baf8336.png',
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
    assets: 'public/assets',
  },
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    statsFilename: 'stats.json',
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  },
  // externals: {
  //   'react': 'window.React',
  //   'react-dom': 'window.ReactDOM',
  // },
  // scripts: process.env.NODE_ENV === 'development' ? [
  //   'https://gw.alipayobjects.com/os/lib/react/16.13.1/umd/react.development.js',
  //   'https://gw.alipayobjects.com/os/lib/react-dom/16.13.1/umd/react-dom.development.js',
  // ] : [
  //   'https://gw.alipayobjects.com/os/lib/react/16.13.1/umd/react.production.min.js',
  //   'https://gw.alipayobjects.com/os/lib/react-dom/16.13.1/umd/react-dom.production.min.js',
  // ],
  copy: [
    {
      from: 'public/assets/',
      to: 'assets/',
    },
  ],
  links: [
    {
      rel: 'preconnect',
      href: 'https://fonts.font.im',
      crossOrigin: true,
    },
    {
      href: 'https://fonts.font.im/css?family=Roboto:400,500,700&display=swap',
      rel: 'stylesheet',
    },
    {
      href:
        'https://fonts.font.im/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap',
      rel: 'stylesheet',
    },
  ],
  chunks: ['react', 'antd', 'umi', 'echarts', 'moment', 'vendors'],
  chainWebpack: function (config: any) {
    config.merge({
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          minChunks: 3,
          automaticNameDelimiter: '.',
          cacheGroups: {
            umi: {
              name: 'umi',
              test: /[\\/]node_modules[\\/](umi)[\\/]/,
              priority: 10,
              enforce: true,
            },
            antd: {
              name: 'antd',
              test: /[\\/]node_modules[\\/](@ant-design|antd)[\\/]/,
              priority: 10,
              enforce: true,
            },
            echarts: {
              name: 'echarts',
              test: /[\\/]node_modules[\\/](echarts)[\\/]/,
              priority: 10,
              enforce: true,
            },
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 10,
              enforce: true,
            },
            moment: {
              name: 'moment',
              test: /[\\/]node_modules[\\/](moment)[\\/]/,
              priority: 10,
              enforce: true,
            },
            vendors: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/](?!umi|@ant-design|antd|echarts|react|react-dom|moment).*$/,
              priority: 11,
              enforce: true,
            },
          },
        },
      },
    });
  },
};
