import { formatSat, strAbbreviation } from 'common/utils';
// import 'common/vconsole';

const bsv = window.sensilet;

function checkExtension() {
  if (!bsv) {
    if (
      confirm(
        '请先安装Sensilet插件。如果已经安装，请刷新页面。点击确定下载插件。',
      )
    ) {
      window.open('https://test.sensilet.com/sensilet.zip');
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
      let accountInfo = {};
      const bsvBalance = await getBsvBalance();

      const userAddress = await bsv.getAccount();
      const tokenBalance = await getSensibleFtBalance();
      // const network = await bsv.getNetwork();
      const network = 'mainnet';

      const userBalance = {
        BSV: bsvBalance,
        ...tokenBalance,
      };
      accountInfo = {
        ...accountInfo,
        userBalance,
        userAddress,
        userAddressShort: strAbbreviation(userAddress, [7, 7]),
        network,
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
