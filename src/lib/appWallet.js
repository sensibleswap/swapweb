import { formatSat, strAbbreviation } from 'common/utils';
// import 'common/vconsole';

const callJavaScriptBridge = (method, param = {}) => {
  const jsCallbackName = `_voltJsCallback_${Date.now()}_${Math.round(
    Math.random() * 1e10,
  )}`;
  const data = {
    method,
    param,
    callback: jsCallbackName,
  };

  return new Promise((resolve, reject) => {
    window[jsCallbackName] = function (result, msg) {
      msg ? reject(new Error(msg)) : resolve(result);
    };
    window._volt_javascript_bridge.postMessage(JSON.stringify(data));
  });
};

const getAccountInfo = () => {
  return callJavaScriptBridge('volt.bsv.getAccountInfo');
};

const getBsvBalance = async () => {
  const res = await callJavaScriptBridge('volt.bsv.getBsvBalance');
  return formatSat(res.free);
};

const getAddress = () => {
  return callJavaScriptBridge('volt.bsv.getDepositAddress');
};

const getChangeAddress = () => {
  return callJavaScriptBridge('volt.bsv.getChangeAddress');
};

const getSensibleFtBalance = async () => {
  const res = await callJavaScriptBridge('volt.bsv.getSensibleFtBalance');

  const userBalance = {};
  res.forEach((item) => {
    userBalance[item.genesis] = formatSat(item.free, item.tokenDecimal);
  });
  return userBalance;
};

export default {
  info: async () => {
    let accountInfo = await getAccountInfo();
    const bsvBalance = await getBsvBalance();
    const userAddress = await getAddress();
    const changeAddress = await getChangeAddress();
    const tokenBalance = await getSensibleFtBalance();

    const userBalance = {
      BSV: bsvBalance,
      ...tokenBalance,
    };

    accountInfo = {
      ...accountInfo,
      userBalance,
      changeAddress,
      userAddress,
      // userAddressShort: paymail || strAbbreviation(userAddress, [7, 7]),
      userAddressShort: strAbbreviation(userAddress, [7, 7]),
      network: parseInt(accountInfo.token_map_id) === 7 ? 'testnet' : 'mainnet',
    };
    // console.log('accountInfo:', accountInfo);
    return accountInfo;
  },

  connectAccount: (network) => {
    return callJavaScriptBridge('volt.bsv.connectAccount', {
      token_map_id: network === 'testnet' ? 7 : 1,
    });
  },

  exitAccount: async () => {
    const res = await callJavaScriptBridge('volt.bsv.disconnectAccount');
    return res;
  },

  transferBsv: (params) => {
    const { address, amount, note = '', changeAddress, noBroadcast } = params;
    return callJavaScriptBridge('volt.bsv.transfer', {
      noBroadcast,
      list: [
        {
          type: 'bsv',
          note,
          receiver_address: address,
          receiver_amount: amount,
          change_address: changeAddress,
        },
      ],
    });
  },

  transferAll: (params) => {
    let data = [];
    const { datas, noBroadcast } = params;
    datas.forEach((item) => {
      const {
        address,
        amount,
        codehash,
        genesis,
        changeAddress,
        note = '',
      } = item;
      if (item.type === 'bsv') {
        data.push({
          type: 'bsv',
          note,
          receiver_address: address,
          receiver_amount: amount,
          change_address: changeAddress,
        });
      } else if (item.type === 'sensibleFt') {
        data.push({
          type: 'sensibleFt',
          note,
          receiver_address: address,
          receiver_amount: amount,
          change_address: changeAddress,
          codehash,
          genesis,
        });
      }
    });

    return callJavaScriptBridge('volt.bsv.transfer', {
      noBroadcast,
      errorBreak: true,
      list: data.list ? data.list : data,
    });
  },

  signTx: (params) => {
    return callJavaScriptBridge('volt.bsv.signTx', {
      list: [params],
    });
  },
};
