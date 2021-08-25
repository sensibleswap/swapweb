'use strict';
import BaseAPI from './base';
import { isTestNet } from 'common/utils';

class History extends BaseAPI {
  _request(api, params = {}, method = 'GET', url = '', catchError) {
    if (isTestNet()) {
      this.baseUrl = 'https://api.sensiblequery.com/test/contract/swap-data/';
    } else {
      this.baseUrl = 'https://api.sensible.satoplay.cn/contract/swap-data/';
    }

    if (url) this.baseUrl = url;

    let api_url = this.baseUrl + api;
    return this.sendRequest(api_url, params, method, catchError);
  }

  query(params) {
    const { codeHash, genesisHash, size } = params;
    return this._request(`${codeHash}/${genesisHash}`, { start: 690000, size });
  }
}

export default new History();
