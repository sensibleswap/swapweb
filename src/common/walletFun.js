import webWallet from 'lib/webWallet';
import voltWallet from 'lib/volt';
import { formatSat } from 'common/utils';

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
      console.log('result:', result, 'msg:', msg);
      msg ? reject(new Error(msg)) : resolve(result);
    };
    console.log('data:', data);
    window._volt_javascript_bridge.postMessage(JSON.stringify(data));
  });
};

const connectWallet = async (type = 1, network) => {
  if (type === 1) {
    return webWallet.requestAccount();
  }
  if (type === 2) {
    return voltWallet.connectAccount({ network });
  }
  if (type === 3) {
    const res = await callJavaScriptBridge('volt.bsv.connectAccount', {
      token_map_id: 1,
    });
    console.log('connectResult:', res);
    return res;
  }
};

const getAccountInfo = async (type = 1) => {
  if (type === 1) {
    return webWallet.getAccount();
  }
  if (type === 2) {
    return voltWallet.getAccountInfo();
  }
  if (type === 3) {
    const res = await callJavaScriptBridge('volt.bsv.getAccountInfo');
    console.log('accountInfo:', res);
    return res;
  }
};

const getPaymail = (type) => {
  if (type === 2) {
    return voltWallet.getPaymail();
  }
  return false;
};

const getBsvBalance = async (type = 1) => {
  if (type === 1) {
    const res = await webWallet.getBsvBalance();

    return formatSat(res.balance);
  }
  if (type === 2) {
    const res = await voltWallet.getBsvBalance();
    return formatSat(res.free);
  }

  if (type === 3) {
    const res = await callJavaScriptBridge('volt.bsv.getBsvBalance');
    console.log('bsvBalance:', res);

    return formatSat(res.balance);
  }
};

const getAddress = async (type = 1) => {
  if (type === 1) {
    return webWallet.getAddress();
  }
  if (type === 2) {
    return voltWallet.getDepositAddress();
  }

  if (type === 3) {
    const res = await callJavaScriptBridge('volt.bsv.getDepositAddress');
    console.log('DepositAddress:', res);
    return res;
  }
};

const getNetwork = (type = 1) => {
  if (type === 1) {
    return '';
  }
  if (type === 2) {
    return voltWallet.getNetwork();
  }
};

const getSensibleFtBalance = async (type = 1) => {
  if (type === 1) {
    const res = await webWallet.getSensibleFtBalance();
    const userBalance = {};
    res.forEach((item) => {
      userBalance[item.genesis] = formatSat(item.balance, item.tokenDecimal);
    });
    return userBalance;
  }
  if (type === 2) {
    const res = await voltWallet.getSensibleFtBalance();
    const userBalance = {};
    res.forEach((item) => {
      userBalance[item.genesis] = formatSat(item.free, item.tokenDecimal);
    });
    return userBalance;
  }

  if (type === 3) {
    const res = await callJavaScriptBridge('volt.bsv.getSensibleFtBalance');
    console.log('SensibleFtBalance:', res);

    const userBalance = {};
    res.forEach((item) => {
      userBalance[item.genesis] = formatSat(item.free, item.tokenDecimal);
    });
    return userBalance;
  }
};
const exitAccount = async (type) => {
  webWallet.exitAccount();
  voltWallet.disconnectAccount();
  if (type === 3) {
    const res = await callJavaScriptBridge('volt.bsv.disconnectAccount');
    console.log('disconnectAccount:', res);
    return res;
  }
};
const transferBsv = async (
  type = 1,
  { address, amount },
  noBroadcast = false,
) => {
  if (type === 1) {
    return webWallet.transferBsv({
      noBroadcast,
      receivers: [
        {
          address,
          amount,
        },
      ],
    });
  }
  if (type === 2) {
    return voltWallet.transfer({
      noBroadcast,
      type: 'bsv',
      data: {
        amountExact: false,
        receivers: [{ address, amount }],
      },
    });
  }
  if (type === 3) {
    const res = await callJavaScriptBridge('volt.bsv.transfer', {
      noBroadcast,
      type: 'bsv',
      data: {
        amountExact: false,
        receivers: [{ address, amount }],
      },
    });
    console.log('disconnectAccount:', res);
    return res;
  }
};
const transferSensibleFt = (
  type = 1,
  { address, amount, codehash, genesis },
) => {
  if (type === 1) {
    return webWallet.transferSensibleFt({
      receivers: [
        {
          address,
          amount,
        },
      ],
      codehash,
      genesis,
    });
  }
  if (type === 2) {
    return voltWallet.transfer({
      type: 'sensibleFt',
      data: {
        codehash,
        genesis,
        receivers: [{ address, amount }],
      },
    });
  }
  // if (type === 3) {

  //   const res = await callJavaScriptBridge("volt.bsv.transferSensibleFt", {
  //     type: 'sensibleFt',
  //     data: {
  //       codehash,
  //       genesis,
  //       receivers: [{ address, amount }],
  //     },
  //   });
  //   console.log('disconnectAccount:', res);
  //   return res;
  // }
};
const transferAll = (type = 1, param = []) => {
  if (type === 1) {
    let data = [];
    param.forEach((item) => {
      if (item.type === 'bsv') {
        let { address, amount, noBroadcast = false } = item;
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
        let {
          address,
          amount,
          codehash,
          genesis,
          rabinApis,
          noBroadcast = false,
        } = item;
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
    return webWallet.transferAll(data);
  }
  if (type === 2) {
    let data = [];
    let noBroadcast = false;
    param.forEach((item) => {
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
      noBroadcast = item.noBroadcast;
    });

    return voltWallet.batchTransfer({
      noBroadcast,
      errorBreak: true,
      list: data,
    });
  }
};

const signTx = async (type, param) => {
  if (type === 1) {
    return webWallet.signTx(param);
  }

  if (type === 2) {
    return voltWallet.signTx(param);
  }

  if (type === 3) {
    await window._volt_javascript_bridge.postMessage(
      JSON.stringify({
        method: 'volt.bsv.signTx',
        param,
        callback: 'signCallback',
      }),
    );
    return window.signCallback();
  }
};
export default {
  connectWallet,
  getAccountInfo,
  getPaymail,
  getBsvBalance,
  getAddress,
  getNetwork,
  getSensibleFtBalance,
  exitAccount,
  transferBsv,
  transferSensibleFt,
  transferAll,
  signTx,
};
