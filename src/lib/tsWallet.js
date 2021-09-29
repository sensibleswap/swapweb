import webWallet from 'bsv-web-wallet';
import { formatSat, strAbbreviation } from 'common/utils';
const { Bsv } = webWallet;

const bsv = new Bsv({
  pageUrl: 'https://wallet.tswap.io',
});

const getBsvBalance = async () => {
  const res = await bsv.getBsvBalance();
  return formatSat(res.balance);
};

const getSensibleFtBalance = async () => {
  const res = await bsv.getSensibleFtBalance();
  const userBalance = {};
  res.forEach((item) => {
    userBalance[item.genesis] = formatSat(item.balance, item.tokenDecimal);
  });
  return userBalance;
};

export default {
  info: async () => {
    let accountInfo = await bsv.getAccount();
    const bsvBalance = await getBsvBalance();
    const userAddress = await bsv.getAddress();
    const tokenBalance = await getSensibleFtBalance();

    const userBalance = {
      BSV: bsvBalance,
      ...tokenBalance,
    };
    accountInfo = {
      ...accountInfo,
      userBalance,
      userAddress,
      userAddressShort: strAbbreviation(userAddress, [7, 7]),
    };
    // console.log('accountInfo:',accountInfo);

    return accountInfo;
  },

  connectAccount: () => {
    return bsv.requestAccount();
  },

  exitAccount: () => {
    return bsv.exitAccount();
  },

  transferBsv: (params) => {
    const { address, amount, noBroadcast } = params;
    return bsv.transferBsv({
      noBroadcast,
      receivers: [
        {
          address,
          amount,
        },
      ],
    });
  },

  transferAll: (params) => {
    const { datas, noBroadcast } = params;
    let data = [];
    datas.forEach((item) => {
      let { type, address, amount } = item;
      if (type === 'bsv') {
        data.push({
          receivers: [
            {
              address,
              amount,
            },
          ],
          noBroadcast,
        });
      } else if (item.type === 'sensibleFt') {
        let { address, amount, codehash, genesis, rabinApis } = item;
        data.push({
          receivers: [
            {
              address,
              amount,
            },
          ],
          codehash,
          genesis,
          rabinApis,
          noBroadcast,
        });
      }
    });
    return bsv.transferAll(data);
  },

  signTx: (params) => {
    return bsv.signTx(params);
  },
};
