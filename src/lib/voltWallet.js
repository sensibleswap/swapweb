import { Bsv } from '@volt.id/sdk';
import { formatSat, strAbbreviation } from 'common/utils';
// import 'common/vconsole';

const bsv = new Bsv();
//   {
//   iframeUrl: 'https://sdkpage.volt.id/hash_d62801e/iframe',
//   popupUrl: 'https://sdkpage.volt.id/hash_d62801e/popup',
//   apiPrefix: {
//     tls: true,
//     endpoint: 'volt.id',
//   },
// }
const getBsvBalance = async () => {
  const res = await bsv.getBsvBalance();
  return formatSat(res.free);
};

const getSensibleFtBalance = async () => {
  const res = await bsv.getSensibleFtBalance();
  const userBalance = {};
  res.forEach((item) => {
    userBalance[item.genesis] = formatSat(item.free, item.tokenDecimal);
  });
  return userBalance;
};

export default {
  bsv,
  info: async () => {
    let accountInfo = await bsv.getAccountInfo();
    const bsvBalance = await getBsvBalance();
    const userAddress = await bsv.getDepositAddress();
    const tokenBalance = await getSensibleFtBalance();
    const network = await bsv.getNetwork();
    const paymail = await bsv.getPaymail();

    const userBalance = {
      BSV: bsvBalance,
      ...tokenBalance,
    };
    accountInfo = {
      ...accountInfo,
      userBalance,
      userAddress,
      userAddressShort: paymail || strAbbreviation(userAddress, [7, 7]),
      network,
    };
    // console.log('accountInfo:', accountInfo);
    return accountInfo;
  },

  connectAccount: (network) => {
    return bsv.connectAccount({ network });
  },

  exitAccount: () => {
    return bsv.disconnectAccount();
  },

  transferBsv: (params) => {
    const { address, amount, note = '', noBroadcast } = params;

    return bsv.transfer({
      noBroadcast,
      type: 'bsv',
      data: {
        amountExact: false,
        receivers: [{ address, amount, note }],
      },
    });
  },

  transferAll: (params) => {
    let data = [];
    const { datas, noBroadcast } = params;
    datas.forEach((item) => {
      const { address, amount, codehash, genesis } = item;
      if (item.type === 'bsv') {
        data.push({
          type: 'bsv',
          data: {
            amountExact: false,
            receivers: [{ address, amount }],
          },
        });
      } else if (item.type === 'sensibleFt') {
        data.push({
          type: 'sensibleFt',
          data: {
            codehash,
            genesis,
            receivers: [{ address, amount }],
          },
        });
      }
    });

    return bsv.batchTransfer({
      noBroadcast,
      errorBreak: true,
      list: data,
    });
  },

  signTx: (params) => {
    return bsv.signTx(params);
  },
};
