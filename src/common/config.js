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
  slippage_tolerance_value: 'VoltTokenSwapSlipTolValue',
  defaultSlipValue: 1,
};

export const feeRate = 0.0025;
export const FEE_FACTOR = 10000;

export const MINAMOUNT = 1000;

export const icons = {
  bsv: {
    type: 'iconlogo-bitcoin',
  },
  ba85ed5e6f4492e2789f92d8c66cbe211943bdfc: {
    //asc
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791ba85ed5e6f4492e2789f92d8c66cbe211943bdfc.png',
  },
  ac42d90b83291e9c83d25bfe654cf83e0042b5a7: {
    //bart
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791ac42d90b83291e9c83d25bfe654cf83e0042b5a7.jpg',
  },
  '341476e63af470912dbd166b19cfb21429c32566': {
    //boex
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791341476e63af470912dbd166b19cfb21429c32566.jpeg',
  },
  a0c26840c1a9f8bbad3c5e743efaf46e13623969: {
    //cc
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791a0c26840c1a9f8bbad3c5e743efaf46e13623969.jpg',
  },
  f460d392aea8ee18a0e315588ff22ab8ca1c84b6: {
    //ceo
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791f460d392aea8ee18a0e315588ff22ab8ca1c84b6.jpg',
  },
  '54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3': {
    //mc
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb79154256eb1b9c815a37c4af1b82791ec6bdf5b3fa3.jpg',
  },
  '8e9c53e1a38ff28772db99ee34a23bb305062a1a': {
    //ovts
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb7918e9c53e1a38ff28772db99ee34a23bb305062a1a.jpg',
  },
  '5d15eedd93c90d91e0d76de5cc932c833baf8336': {
    //tsc
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb7915d15eedd93c90d91e0d76de5cc932c833baf8336.png',
  },
  '67cfb6b1b163946a738cb0c2bed781d57d8099a7': {
    //usdt
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb79167cfb6b1b163946a738cb0c2bed781d57d8099a7.png',
  },
  '525d000031b3d45303cf96f3c38a890012d93040': {
    //whst
    url: 'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/whst.jpg',
  },
  test: {
    type: 'iconTS',
  },
  tbsv: {
    type: 'iconlogo-bitcoin',
  },
};
