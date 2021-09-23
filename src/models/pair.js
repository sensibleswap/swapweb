import pairApi from '../api/pair';
import { TSWAP_CURRENT_PAIR, DEFAULT_PAIR } from 'common/const';
import { parseUrl } from 'common/utils';
import debug from 'debug';
const log = debug('pair');

const { localStorage } = window;

export default {
  namespace: 'pair',

  state: {
    allPairs: {},
    currentPair: '',
    pairData: {},
    token1: {},
    token2: {},
    LP: 100000,
  },

  subscriptions: {
    async setup({ dispatch, history }) {},
  },

  effects: {
    *getAllPairs({ payload }, { call, put }) {
      const res = yield pairApi.queryAllPairs.call(pairApi);
      log('allPairs:', res);
      const { data } = res;

      if (res.code !== 0) {
        console.log(res.msg);
        return res;
      }
      const urlPair = parseUrl(data);

      let currentPair =
        urlPair || localStorage.getItem(TSWAP_CURRENT_PAIR) || DEFAULT_PAIR;

      if (!currentPair || !data[currentPair]) {
        Object.keys(data).forEach((item) => {
          if (item.indexOf('bsv-') > -1 || item.indexOf('-bsv') > -1) {
            currentPair = item;
            localStorage.setItem(TSWAP_CURRENT_PAIR, item);
          }
        });
      }

      yield put({
        type: 'savePair',
        payload: {
          allPairs: data,
          currentPair,
          // mode: 'init',
        },
      });
      return data;
    },

    *getPairData({ payload }, { call, put, select }) {
      let { currentPair } = payload;

      if (!currentPair)
        currentPair = yield select((state) => state.pair.currentPair);

      const res = yield pairApi.querySwapInfo.call(pairApi, currentPair);
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
      const res = yield pairApi.querySwapInfo.call(pairApi, currentPair);
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

    *reqSwap({ payload }, { call, put }) {
      payload.source = 'tswap.io';
      const res = yield pairApi.reqSwap.call(pairApi, payload);
      log('reqSwap:', res);
      return res;
    },

    *swap({ payload }, { call, put }) {
      const res = yield pairApi.swap.call(pairApi, payload);
      log('swap:', payload, res);
      return res;
    },

    *token1toToken2({ payload }, { call, put }) {
      const res = yield pairApi.token1toToken2.call(pairApi, payload);
      log('swap:', payload, res);
      return res;
    },

    *token2toToken1({ payload }, { call, put }) {
      const res = yield pairApi.token2toToken1.call(pairApi, payload);
      log('swap:', payload, res);
      return res;
    },

    *addLiq({ payload }, { call, put }) {
      const res = yield pairApi.addLiq.call(pairApi, payload);
      log('addLiq:', payload, res);
      return res;
    },

    *removeLiq({ payload }, { call, put }) {
      const res = yield pairApi.removeLiq.call(pairApi, payload);
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
