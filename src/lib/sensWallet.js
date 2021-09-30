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
  console.log(res);
  const userBalance = {};
  res.forEach((item) => {
    userBalance[item.genesis] = formatSat(item.free, item.tokenDecimal);
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
      console.log('accountInfo:', accountInfo);
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

  transferBsv: (params) => {
    if (checkExtension()) {
      const { address, amount, noBroadcast } = params;

      console.log({
        receivers: [{ address, amount }],
      });
      return bsv.transferBsv({
        noBroadcast,
        receivers: [{ address, amount }],
      });
    }
  },

  transferAll: (params) => {
    if (checkExtension()) {
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

      return bsv.transferAll({
        noBroadcast,
        errorBreak: true,
        list: data,
      });
    }
  },

  signTx: (params) => {
    return bsv.signTx(params);
  },
};
