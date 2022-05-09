'use strict';
import BaseAPI from './base';
import { isTestNet } from 'common/utils';

class Stake extends BaseAPI {
  _request(api, params = {}, method = 'GET', url = '', catchError) {
    if (isTestNet()) {
      this.baseUrl = 'https://api.tswap.io/stake/test/';
    } else {
      this.baseUrl = 'https://api.tswap.io/stake/test/';
    }

    if (url) this.baseUrl = url;

    let api_url = this.baseUrl + api;
    return this.sendRequest(api_url, params, method, catchError);
  }

  queryAllPairs(address) {
    if (address) {
      return this._request('allpairs', { address });
    }
    return this._request('allpairs');
  }

  queryStakeInfo(symbol) {
    return this._request('stakeinfo', { symbol });
  }

  queryUserInfo(symbol, address) {
    return this._request('userinfo', { symbol, address });
  }

  reqStake(params) {
    return this._request('reqstakeargs', params, 'POST');
  }

  deposit(params) {
    return this._request('deposit', params, 'POST');
  }

  unlock(params) {
    return this._request('unlock', params, 'POST');
  }

  unlock2(params) {
    return this._request('unlock2', params, 'POST');
  }

  withdraw(params) {
    return this._request('withdraw', params, 'POST');
  }

  withdraw2(params) {
    return this._request('withdraw2', params, 'POST');
  }

  harvest(params) {
    return this._request('harvest', params, 'POST');
  }

  harvest2(params) {
    return this._request('harvest2', params, 'POST');
  }
}

export default new Stake();
