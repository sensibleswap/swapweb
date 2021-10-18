import 'whatwg-fetch';
import pairApi from '../api/pair';
import customApi from '../api/custom';
import { TSWAP_CURRENT_PAIR, DEFAULT_PAIR } from 'common/const';
import { parseUrl } from 'common/utils';
import debug from 'debug';

const log = debug('pair');
const iconUrl = 'https://volt.id/api.json?method=sensibleft.getSensibleFtList';

const { localStorage } = window;

export default {
  namespace: 'pair',

  state: {
    allPairs: {},
    pairList: {},
    currentPair: '',
    customPair: false,
    pairData: {},
    token1: {},
    token2: {},
    LP: 100000,
    iconList: '',
  },

  subscriptions: {
    async setup({ dispatch, history }) {
      fetch(iconUrl)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          let icons;
          // console.log(data);
          if (data.success && data.data.list) {
            icons = {
              bsv: {
                type: 'iconlogo-bitcoin',
              },
            };
            data.data.list.forEach((item) => {
              icons[item.genesis.toString()] = {
                url: item.logo,
              };
            });
          }
          dispatch({
            type: 'save',
            payload: {
              iconList: icons,
            },
          });
        });
    },
  },

  effects: {
    *getAllPairs({ payload }, { call, put, select }) {
      let currentPair;
      if (payload) {
        currentPair = payload.currentPair;
      }

      const res = yield pairApi.queryAllPairs.call(pairApi);
      log('allPairs:', res);
      const { data } = res;

      if (res.code !== 0) {
        console.log(res.msg);
        return res;
      }
      let allPairs = { ...data };

      const urlPair = parseUrl();
      // console.log('urlPair:', urlPair)
      let customPair; // = yield select((state) => state.pair.customPair);
      if (!currentPair) {
        currentPair =
          urlPair || localStorage.getItem(TSWAP_CURRENT_PAIR) || DEFAULT_PAIR;
      }
      // console.log('localStorage:',localStorage.getItem(TSWAP_CURRENT_PAIR))

      if (data[currentPair]) {
        customPair = false;
      } else {
        const res1 = yield customApi.pairInfo.call(customApi, {
          symbol: currentPair,
        });
        // console.log(res1);
        if (!res1.code) {
          res1.data &&
            res1.data.length > 0 &&
            res1.data.forEach((item) => {
              allPairs[item.token2.tokenID] = item;
            });
          customPair = true;
        } else {
          customPair = false;
          currentPair = '';
        }
      }

      // console.log('105-currentPair:',currentPair, 'payload:',payload)
      if (!currentPair || !allPairs[currentPair]) {
        Object.keys(data).forEach((item) => {
          if (item.indexOf('bsv-') > -1 || item.indexOf('-bsv') > -1) {
            currentPair = item;
            customPair = false;
          }
        });
      }

      // console.log('localstorage.set:', currentPair);
      localStorage.setItem(TSWAP_CURRENT_PAIR, currentPair);

      yield put({
        type: 'savePair',
        payload: {
          allPairs,
          currentPair,
          pairList: { ...data },
          customPair,
          // mode: 'init',
        },
      });
      return allPairs;
    },

    *getPairData({ payload }, { call, put, select }) {
      let { currentPair } = payload;

      if (!currentPair)
        currentPair = yield select((state) => state.pair.currentPair);

      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.querySwapInfo.call(api, currentPair);
      log('init-pairData:', currentPair, res);
      const { code, msg, data } = res;
      if (code !== 0) {
        console.log(msg);
        return res;
      }
      if (currentPair) {
        yield put({
          type: 'savePair',
          payload: {
            pairData: data,
            currentPair,
            mode: 'force',
          },
        });
      }

      // console.log(data)
      return data;
    },

    *updatePairData({ payload }, { call, put, select }) {
      // let { currentPair } = payload;
      const currentPair = yield select((state) => state.pair.currentPair);
      if (!currentPair) return;
      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.querySwapInfo.call(api, currentPair);
      const { code, msg, data } = res;
      if (code !== 0) {
        return res;
      }
      yield put({
        type: 'save',
        payload: {
          pairData: data,
        },
      });

      // console.log(data)
      return data;
    },

    *reqSwap({ payload }, { call, put, select }) {
      payload.source = 'tswap.io';
      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.reqSwap.call(api, payload);
      log('reqSwap:', res);
      return res;
    },

    *swap({ payload }, { call, put, select }) {
      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.swap.call(api, payload);
      log('swap:', payload, res);
      return res;
    },

    *token1toToken2({ payload }, { call, put, select }) {
      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.token1toToken2.call(api, payload);
      log('swap:', payload, res);
      return res;
    },

    *token2toToken1({ payload }, { call, put, select }) {
      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.token2toToken1.call(api, payload);
      log('swap:', payload, res);
      return res;
    },

    *addLiq({ payload }, { call, put, select }) {
      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.addLiq.call(api, payload);
      log('addLiq:', payload, res);
      return res;
    },

    *removeLiq({ payload }, { call, put, select }) {
      const customPair = yield select((state) => state.pair.customPair);
      const api = customPair ? customApi : pairApi;
      const res = yield api.removeLiq.call(api, payload);
      log('removeLiq:', payload, res);
      return res;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    savePair(state, action) {
      let { allPairs, currentPair, mode } = action.payload;
      if (!allPairs) allPairs = state.allPairs;
      if (!currentPair) {
        log('no currentPair');
        return { ...state, allPairs, currentPair };
      }

      if (mode === 'init' && state.currentPair && allPairs[state.currentPair]) {
        currentPair = state.currentPair;
      }

      const { token1, token2, lptoken, rabinApis } = allPairs[currentPair];

      return {
        ...state,
        ...action.payload,
        currentPair,
        token1,
        token2,
        lptoken,
        rabinApis,
      };
    },
  },
};
