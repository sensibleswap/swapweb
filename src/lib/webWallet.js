import webWallet from 'bsv-web-wallet';
const { Bsv } = webWallet;

const bsv = new Bsv({
  pageUrl: 'https://wallet.tswap.io',
});
export default bsv;
