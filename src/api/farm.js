'use strict';
import BaseAPI from './base';
import { TSWAP_NETWORK } from 'common/const';

class Farm extends BaseAPI {
  constructor(props) {
    super(props);
    this.baseUrl = 'https://api.tswap.io/farm/';
    if (localStorage.getItem(TSWAP_NETWORK) === 'testnet') {
      this.baseUrl = 'https://api.tswap.io/farm/test/';
    }
  }

  queryAllPairs(address) {
    if (address) {
      return this._request('allpairs', { address });
    }
    return this._request('allpairs');
  }

  querySwapInfo(symbol) {
    return this._request('farminfo', { symbol });
  }

  reqSwap(params) {
    return this._request('reqfarmargs', params, 'POST');
  }

  deposit(params) {
    return this._request('deposit', params, 'POST');
  }

  withdraw(params) {
    return this._request('withdraw', params, 'POST');
  }

  withdraw2(params) {
    return this._request('withdraw2', params, 'POST');
  }
}

export default new Farm();
