import { formatSat, strAbbreviation } from 'common/utils';
import _ from 'i18n';
// import 'common/vconsole';

const bsv = window.voltWallet;

function checkExtension() {
  if (!bsv) {
    if (confirm(_('download_voltwallet'))) {
      window.open('https://volt.id/');
    }
    return false;
  }
  return true;
}

const getBsvBalance = async () => {
  const res = await bsv.getBsvBalance();
  return formatSat(res.balance.total);
};

const getSensibleFtBalance = async () => {
  const res = await bsv.getSensibleFtBalance();
  // console.log('getSensibleFtBalance:',res);
  const userBalance = {};
  res.forEach((item) => {
    userBalance[item.genesis] = formatSat(item.balance, item.decimal);
  });
  return userBalance;
};

export default {
  info: async () => {
    if (checkExtension()) {
      let accountInfo = await bsv.getAccount();
      const paymail = await bsv.getPaymail();
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

  connectAccount: () => {
    if (checkExtension()) {
      return bsv.requestAccount({});
    }
  },

  exitAccount: () => {
    return bsv.exitAccount();
  },

  transferBsv: async (params) => {
    if (checkExtension()) {
      const { address, amount, noBroadcast } = params;

      const res = await bsv.transferBsv({
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

      const res = await bsv.transferAll(data);
      return res;
    }
  },

  signTx: async (params) => {
    const res = await bsv.signTx({ list: [params] });
    // console.log(res); debugger
    return res.sigList[0];
  },
};
