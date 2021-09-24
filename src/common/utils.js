// 通用函数
'use strict';
import bytes from 'bytes';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import format from 'format-number';
import { TSWAP_NETWORK, DEFAULT_NET } from 'common/const';
import debug from 'debug';
const log = debug('utils');
const location = window.location;

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return date;
  }
  if (typeof date === 'string') {
    if (/^\d+$/.test(date)) {
      date = parseInt(date, 10);
    }
    // date = new Date(date.date());
  }
  return moment(date).format(format);
}

export function getTimeAgo(timeAgo) {
  const timeRangeMap = {
    '4h': 60 * 60 * 4,
    '1d': 60 * 60 * 24,
    '1w': 60 * 60 * 24 * 7,
    '1m': 60 * 60 * 24 * 30,
  };

  return new Date().getTime() / 1000 - timeRangeMap[timeAgo];
}

// 将时间戳转换成日期格式
export function formatTime(time, fmt = 'yyyy-MM-dd hh:mm:ss') {
  if (!time) return '';
  let date = time;
  if (typeof time === 'number') {
    date = new Date(time);
  } else if (typeof time === 'string') {
    date = new Date(+time);
  }
  var o = {
    'y+': date.getFullYear(),
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S+': date.getMilliseconds(), //毫秒
  };
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      if (k === 'y+') {
        fmt = fmt.replace(RegExp.$1, ('' + o[k]).substr(4 - RegExp.$1.length));
      } else if (k === 'S+') {
        var lens = RegExp.$1.length;
        lens = lens === 1 ? 3 : lens;
        fmt = fmt.replace(
          RegExp.$1,
          ('00' + o[k]).substr(('' + o[k]).length - 1, lens),
        );
      } else {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length),
        );
      }
    }
  }
  return fmt;
}

// class 操作
export function hasClass(elements, cName) {
  return !!elements.className.match(new RegExp('(\\s|^)' + cName + '(\\s|$)'));
}

export function addClass(elements, cName) {
  if (!hasClass(elements, cName)) {
    elements.className += ' ' + cName;
  }
}

export function removeClass(elements, cName) {
  if (hasClass(elements, cName)) {
    elements.className = elements.className.replace(
      new RegExp('(\\s|^)' + cName + '(\\s|$)'),
      ' ',
    );
  }
}

// 格式校验

const regMap = {
  // 中国
  86: /^[1][0-9]{10}$/,
  84: /^[0-9]{9,11}$/,
  91: /^[0-9]{9,12}$/,
  1: /^[0-9]{9,12}$/,
  default: /^[0-9]{5,30}$/,
};

export function validatePhone(zone, phoneNumber) {
  if (!(zone && phoneNumber)) {
    return false;
  }
  const reg = regMap[zone];
  if (!reg) {
    return regMap.default.test(phoneNumber);
    // return true;
  }
  return reg.test(phoneNumber);
}

export function isValidPhone(phoneNumber) {
  for (let key in regMap) {
    if (regMap[key].test(phoneNumber)) {
      return true;
    }
  }
  return false;
}

const mailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
export function validateEmail(email) {
  if (!email) {
    return false;
  }
  return mailReg.test(email);
}

// 加密手机号
export function encodePhone(phone) {
  if (!phone) return;
  return phone.toString().replace(/(\d{3})\d{5}(.*)/, '$1*****$2');
}

/**
 * 从url里获取参数
 * @param {String} name key
 * @param {String} url ?key=1
 */
export function getParameterFromUrl(name) {
  let url = location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// 给大数加上千分号
export function toThousands(num) {
  if (!num) {
    return num;
  }

  if (!parseFloat(num)) {
    return 0;
  }

  let result = '',
    counter = 0;
  num = (num || 0).toString();
  const t = num.split('.');
  const intpart = t[0];
  for (let i = intpart.length - 1; i >= 0; i--) {
    counter++;
    result = intpart.charAt(i) + result;
    if (!(counter % 3) && i != 0) {
      result = ',' + result;
    }
  }

  if (t.length === 1) {
    return result;
  }
  return result + '.' + t[1];
}

// 格式化大小容量
export const formatSize = (value) => {
  return bytes(parseInt(value, 10));
};

// join ClassName
export function jc() {
  return [...arguments].join(' ');
}

export const formatSat = (value, dec = 8) => {
  if (!value) return 0;

  return BigNumber(value).div(Math.pow(10, dec)).toString();
};

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const formatAmount = (value, n = 4) => {
  if (!value) return 0;

  const arr = value.toString().split('.');
  if (value.toString().indexOf('e') > -1 || (arr[1] && arr[1].length > n)) {
    return BigNumber(value).toFixed(n);
  }
  if (typeof value === 'object') return value.toFixed(n);
  return value;
};

function roundNumber({ value, round }) {
  if (!value) {
    return 0;
  }
  const roundTimes = Math.pow(10, round);
  return Math.round(value * roundTimes) / roundTimes;
}

function roundCoinPrice({ value, round = 2 }) {
  if (!value) {
    return 0;
  }
  if (value < 1) {
    round = 4;
  }
  if (value < 0.001) {
    round = 6;
  }
  if (value < 0.00001) {
    round = 8;
  }
  return roundNumber({ value, round });
}

export const formatNumberForDisplay = ({
  value,
  prefix,
  suffix,
  round = 2,
  padRight,
}) => {
  if (!value) {
    return 0;
  }

  const formatter = format({
    prefix,
    suffix,
    truncate: 20,
    padRight,
  });

  const numberValue = Number(value);
  return numberValue <= Math.pow(10, 15)
    ? formatter(roundCoinPrice({ value: numberValue, round }))
    : '∞';
};

export function strAbbreviation(str, arr = [7, 5]) {
  if (!str) return;
  if (str.length < arr[0] + arr[1]) return str;
  const pre = str.substr(0, arr[0]);
  const aft = str.substr(-arr[1], arr[1]);
  return pre + '……' + aft;
}

export function isTestNet() {
  const net = window.localStorage.getItem(TSWAP_NETWORK) || DEFAULT_NET;
  return net === 'testnet';
}

export function parseUrl(data) {
  let [, hash1, hash2, hash3] = location.hash.split('/');
  if (hash2) hash2 = hash2.toLocaleLowerCase();
  if (hash3) hash3 = hash3.toLocaleLowerCase();
  let currentPair;
  if (['swap', 'pool', 'farm'].indexOf(hash1) > -1 && data[hash2]) {
    currentPair = hash2;
  }
  return currentPair;
}
