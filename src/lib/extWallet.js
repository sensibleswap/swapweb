import { formatSat, strAbbreviation } from 'common/utils';
import _ from 'i18n';
// import 'common/vconsole';

const bsv = window.voltWallet;

function checkExtension() {
  if (!window.voltWallet) {
    if (confirm(_('download_voltwallet'))) {
      window.open('https://app.volt.id/#/download');
    }
    return false;
  }
  return true;
}

// const getBsvBalance = async () => {
//   const res = await bsv.getBsvBalance();
//   return formatSat(res.balance.total);
// };

// const getSensibleFtBalance = async () => {
//   const res = await bsv.getSensibleFtBalance();
//   // console.log('getSensibleFtBalance:',res);
//   const userBalance = {};
//   res.forEach((item) => {
//     userBalance[item.genesis] = formatSat(item.balance, item.decimal);
//   });
//   return userBalance;
// };

export default {
  bsv: window.voltWallet,
  info: async () => {
    if (checkExtension()) {
      let accountInfo = await window.voltWallet.getAccount();
      const paymail = await window.voltWallet.getPaymail();
      let userBalance = {};
      accountInfo.balance.forEach((item) => {
        userBalance[item.is_bsv ? 'BSV' : item.genesis] = item.value;
      });

      accountInfo = {
        ...accountInfo,
        userBalance,
        userAddressShort:
          paymail || strAbbreviation(accountInfo.userAddress, [7, 7]),
      };
      //   console.log('accountInfo:', accountInfo);
      return accountInfo;
    }
  },

  connectAccount: (network) => {
    if (checkExtension()) {
      return window.voltWallet.requestAccount({ network });
    }
  },

  exitAccount: () => {
    return window.voltWallet.exitAccount();
  },

  transferBsv: async (params) => {
    if (checkExtension()) {
      const { address, amount, noBroadcast } = params;

      const res = await window.voltWallet.transferBsv({
        broadcast: !noBroadcast,
        receivers: [{ address, amount }],
      });
      // console.log(res);
      return res;
    }
  },

  transferAll: async (params) => {
    if (checkExtension()) {
      let data = [];
      const { datas, noBroadcast } = params;
      datas.forEach((item) => {
        const { address, amount, codehash, genesis, rabinApis } = item;
        if (item.type === 'bsv') {
          data.push({
            broadcast: !noBroadcast,
            receivers: [{ address, amount }],
          });
        } else if (item.type === 'sensibleFt') {
          data.push({
            broadcast: !noBroadcast,
            codehash,
            genesis,
            receivers: [{ address, amount }],
            rabinApis,
          });
        }
      });

      const res = await window.voltWallet.transferAll(data);
      return res;
    }
  },

  signTx: async (params) => {
    try {
      const res = await window.voltWallet.signTx({ list: [params] });
      if (res.sig) return res;
      if (res[0].sig) return res[0];
      return res.sigList[0];
    } catch (error) {
      console.log(error);
      debugger;
    }
  },
};
