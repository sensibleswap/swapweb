'use strict';
import qs from 'querystringify';
import _ from 'i18n';

const location = window.location;
const { search } = location;

export const query = qs.parse(search);

export function agentVersion() {
  var userAgentInfo = window.navigator.userAgent;
  var Agents = [
    'Android',
    'iPhone',
    'SymbianOS',
    'Windows Phone',
    'iPad',
    'iPod',
  ];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      return Agents[v];
      // break;
    }
  }
  return 'PC';
}

export const slippage_data = {
  slippage_tolerance_index: 'VoltTokenSwapSlipTolIndex',
  slippage_tolerance_value: 'VoltTokenSwapSlipTolValue',
  datas: ['0.1', '0.5', '5.00'],
  defaultIndex: 1,
};

export const feeRate = 0.0025;
export const FEE_FACTOR = 10000;

export const walletFunName = {
  1: {
    //web wallet
    connectWallet: 'requestAccount',
    getAccountInfo: 'getAccount',
    getBsvBalance: 'getBsvBalance',
    getAddress: 'getAddress',
    getSensibleFtBalance: 'getSensibleFtBalance',
    exitAccount: 'exitAccount',
    transferBsv: 'transferBsv',
    transferSensibleFt: 'transferSensibleFt',
    transferAll: 'transferAll',
  },
  2: {
    //volt wallet
    connectWallet: 'connectAccount',
    getAccountInfo: 'getAccountInfo',
    getBsvBalance: 'getBsvBalance',
    getAddress: 'getDepositAddress',
    getSensibleFtBalance: 'getSensibleFtBalance',
    exitAccount: 'disconnectAccount',
    transferBsv: 'transfer',
    transferSensibleFt: 'transfer',
    transferAll: 'batchTransfer',
  },
};
