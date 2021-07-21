import webWallet from 'bsv-web-wallet';
const { Bsv } = webWallet;

const bsv = new Bsv({
  pageUrl: 'https://walletv1.tswap.io',
});
export default bsv;
