import BigNumber from 'bignumber.js';
import farmApi from '../api/farm';
import pairApi from '../api/pair';
import { TSWAP_CURRENT_PAIR, DEFAULT_PAIR, USDT_PAIR } from 'common/const';
import { formatSat } from 'common/utils';
import debug from 'debug';
const log = debug('farm');

export default {
  namespace: 'farm',

  state: {
    allPairs: [],
    currentPair: '',
    lockedTokenAmount: 0,
    symbol1: '',
    symbol2: '',
    lptoken: {},
    rewardToken: {},
    currentPairYield: 0,
    bsvPrice: 0,
  },

  subscriptions: {
    async setup({ dispatch, history }) {},
  },

  effects: {
    *getAllPairs({ payload }, { call, put }) {
      const res = yield farmApi.queryAllPairs.call(farmApi, payload.address);
      log('farmApi:', res);
      const { data } = res;

      if (res.code !== 0) {
        console.log(res.msg);
        return res;
      }
      let currentPair =
        localStorage.getItem(TSWAP_CURRENT_PAIR) || DEFAULT_PAIR;
      if (!currentPair || !data[currentPair]) {
        Object.keys(data).forEach((item) => {
          if (
            item.indexOf('bsv-') > -1 ||
            item.indexOf('-bsv') > -1 ||
            item.indexOf('tbsv-') ||
            item.indexOf('-tbsv')
          ) {
            currentPair = item;
            localStorage.setItem(TSWAP_CURRENT_PAIR, item);
          }
        });
      }

      let bsvPrice = 0;

      const price_res = yield pairApi.querySwapInfo.call(pairApi, USDT_PAIR);

      if (price_res.code === 0) {
        bsvPrice = BigNumber(price_res.data.swapToken2Amount)
          .div(price_res.data.swapToken1Amount)
          .multipliedBy(Math.pow(10, 8 - 6))
          .toString();
        console.log(bsvPrice);
      }

      yield put({
        type: 'saveFarm',
        payload: {
          allPairs: data,
          currentPair,
          bsvPrice,
        },
      });
      return {
        data,
        currentPair,
      };
    },

    *updatePairData({ payload }, { call, put, select }) {
      // let { currentPair } = payload;
      const address = yield select((state) => state.user.userAddress);
      const res = yield farmApi.queryAllPairs.call(farmApi, address);
      const { code, msg, data } = res;
      if (code !== 0) {
        return res;
      }

      let bsvPrice = 0;
      const price_res = yield pairApi.querySwapInfo.call(pairApi, USDT_PAIR);

      if (price_res.code === 0) {
        bsvPrice = BigNumber(price_res.data.swapToken2Amount)
          .div(price_res.data.swapToken1Amount)
          .multipliedBy(Math.pow(10, 8 - 6))
          .toString();
        console.log(bsvPrice);
      }

      yield put({
        type: 'saveFarm',
        payload: {
          allPairs: data,
          bsvPrice,
        },
      });

      // console.log(data)
      return data;
    },

    // *getPairData({ payload }, { call, put }) {
    //     let { currentPair } = payload;
    //     const res = yield farmApi.querySwapInfo.call(farmApi, currentPair);
    //     log('init-farmData:', currentPair, res);
    //     const { code, msg, data } = res;
    //     if (code !== 0) {
    //         console.log(msg);
    //         return res;
    //     }
    //     if (currentPair) {
    //         yield put({
    //             type: 'save',
    //             payload: {
    //                 pairData: data,
    //                 currentPair,
    //                 mode: 'force',
    //             },
    //         });
    //     }

    //     // console.log(data)
    //     return data;
    // },

    *reqSwap({ payload }, { call, put }) {
      payload.source = 'tswap.io';
      const res = yield farmApi.reqSwap.call(farmApi, payload);
      log('reqSwap:', res);
      return res;
    },

    *deposit({ payload }, { call, put }) {
      const res = yield farmApi.deposit.call(farmApi, payload);
      log('deposit:', payload, res);
      return res;
    },

    *withdraw({ payload }, { call, put }) {
      const res = yield farmApi.withdraw.call(farmApi, payload);
      log('withdraw:', payload, res);
      return res;
    },

    *withdraw2({ payload }, { call, put }) {
      const res = yield farmApi.withdraw2.call(farmApi, payload);
      log('withdraw2:', payload, res);
      return res;
    },

    *harvest({ payload }, { call, put }) {
      const res = yield farmApi.harvest.call(farmApi, payload);
      log('harvest:', payload, res);
      return res;
    },

    *harvest2({ payload }, { call, put }) {
      const res = yield farmApi.harvest2.call(farmApi, payload);
      log('harvest:', payload, res);
      return res;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    saveFarm(state, action) {
      const { allPairs } = action.payload;
      let { currentPair } = action.payload;
      if (!currentPair) currentPair = state.currentPair;
      if (!currentPair) {
        return {
          ...state,
          ...action.payload,
        };
      }
      let token = {},
        lockedTokenAmount = 0,
        rewardToken = {};
      if (allPairs[currentPair]) {
        const currentPairObj = allPairs[currentPair];
        token = currentPairObj.token;
        lockedTokenAmount = currentPairObj.lockedTokenAmount;
        rewardToken = currentPairObj.rewardToken;
      }

      const pairName = currentPair.toUpperCase().split('-');
      const [symbol1, symbol2] = pairName;
      return {
        ...state,
        ...action.payload,
        lptoken: token,
        rewardToken,
        symbol1,
        symbol2,
        lockedTokenAmount: formatSat(lockedTokenAmount, token.decimal),
      };
    },
  },
};
