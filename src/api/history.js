'use strict';
import BaseAPI from './base';
import { isTestNet } from 'common/utils';

class History extends BaseAPI {
  _request(api, params = {}, method = 'GET', url = '', catchError) {
    if (isTestNet()) {
      this.baseUrl = 'https://api.sensiblequery.com/test/contract/';
    } else {
      this.baseUrl = 'https://api.sensiblequery.com/contract/';
    }

    if (url) this.baseUrl = url;

    let api_url = this.baseUrl + api;
    return this.sendRequest(api_url, params, method, catchError);
  }

  query(params) {
    const { codeHash, genesisHash, type, interval = 2 } = params;
    if (type === 'pool') {
      return this._request(`swap-data/${codeHash}/${genesisHash}`, {
        start: 690000,
        size: 100,
      });
    } else {
      return this._request(`swap-aggregate/${codeHash}/${genesisHash}`, {
        start: 690000,
        interval,
      });
    }
  }
}

export default new History();
