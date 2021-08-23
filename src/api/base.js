'use strict';
import 'whatwg-fetch';
import { gzip } from 'node-gzip';
import querystring from 'querystringify';
import { TSWAP_NETWORK } from 'common/const';
const { localStorage } = window;

export default class API {
  constructor() {
    this.baseUrl = 'https://api.tswap.io/';
    if (localStorage.getItem(TSWAP_NETWORK) === 'testnet') {
      this.baseUrl = 'https://api.tswap.io/test/';
    }

    this._requestQueue = {};
  }

  _request(api, params = {}, method = 'GET', gz = false) {
    // const data = {
    //     params: JSON.stringify(params)
    // };

    // if (url) this.baseUrl = url;

    let api_url = this.baseUrl + api;
    return this.sendRequest(api_url, params, method, gz);
  }

  async sendRequest(
    url,
    data = {},
    method = 'GET',
    gz,
    catchError = true,
    handle,
  ) {
    let key;
    let options;
    if (method.toUpperCase() === 'GET') {
      const params = querystring.stringify(data);
      if (url.indexOf('?') === -1) {
        url = url + '?' + params;
      } else {
        url = url + '&' + params;
      }
      key = url;
      options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include',
      };
    } else {
      key = url + body;
      let body = JSON.stringify(data);
      if (gz) {
        // body = await gzip(body);
        console.log('gzip-body:', body);
      }
      options = {
        method,
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      };
    }

    // if (this.host) {
    //   url = this.host + url;
    // }

    if (!this._requestQueue[key]) {
      this._requestQueue[key] = [];
      fetch(url, options)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          if (handle) {
            data = handle(data);
          }
          // if (data.code) {
          //     const err = new Error(data.msg);
          //     err.code = data.code;
          //     throw err;
          // }
          this._requestQueue[key].forEach((fn) => {
            fn(null, data);
          });
          delete this._requestQueue[key];
        })
        .catch((err) => {
          this._requestQueue[key].forEach((fn) => {
            fn(err);
          });
          delete this._requestQueue[key];
        });
    }

    return new Promise((resolve, reject) => {
      this._requestQueue[key].push((err, data) => {
        if (err) {
          if (catchError) {
            // message.error(err.message, 1);
            console.log(err.msg);
            resolve(err);
          } else {
            reject(err);
          }
        } else {
          resolve(data);
        }
      });
    });
  }
}
