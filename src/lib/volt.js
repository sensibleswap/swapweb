import { Bsv } from '@volt-wallet/sdk';

// const bsv = new Bsv({
//   iframeUrl: 'http://47.108.83.26:9000/iframe/', // iframe 页面地址, 测试时使用这个地址
//   popupUrl: 'http://47.108.83.26:9000/popup/', // popup 页面地址, 测试时使用这个地址
//   apiPrefix: {
//     tls: false, // 后端接口是否 https
//     endpoint: '47.108.83.26:7001', // 后端接口地址, 测试时使用这个地址
//   },
// });

// const bsv = new Bsv({
//   iframeUrl: 'https://sdkpage.volt.id/test/iframe/', // iframe 页面地址, 测试时使用这个地址
//   popupUrl: 'https://sdkpage.volt.id/test/popup/', // popup 页面地址, 测试时使用这个地址
//   apiPrefix: {
//     tls: true, // 后端接口是否 https
//     endpoint: 'volt.id', // 后端接口地址, 测试时使用这个地址
//   },
// });

const bsv = new Bsv({
  iframeUrl: 'https://sdkpage.volt.id/iframe/',
  popupUrl: 'https://sdkpage.volt.id/popup/',
  apiPrefix: {
    tls: true,
    endpoint: 'volt.id',
  },
});

// bsv.enableDebug(true)

export default bsv;
