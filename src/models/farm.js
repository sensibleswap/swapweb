// import BigNumber from 'bignumber.js';
import farmApi from '../api/farm';
import pairApi from '../api/pair';
import { TSWAP_CURRENT_FARM_PAIR, TSWAP_SOURCE } from 'common/const';
import { formatSat, parseUrl } from 'common/utils';
import debug from 'debug';
const log = debug('farm');

export default {
  namespace: 'farm',

  state: {
    allFarmPairs: [],
    currentFarmPair: '',
    lockedTokenAmount: 0,
    symbol1: '',
    symbol2: '',
    lptoken: {},
    rewardToken: {},
    pairYields: {},
    // bsvPrice: 0,
    pairsData: {},
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
      const urlPair = parseUrl();
      let currentFarmPair =
        urlPair || localStorage.getItem(TSWAP_CURRENT_FARM_PAIR);
      if (!currentFarmPair || !data[currentFarmPair]) {
        Object.keys(data).forEach((item) => {
          if (
            item.indexOf('bsv-') > -1 ||
            item.indexOf('-bsv') > -1 ||
            item.indexOf('tbsv-') ||
            item.indexOf('-tbsv')
          ) {
            currentFarmPair = item;
            // console.log('localstorage.set:', item)
            localStorage.setItem(TSWAP_CURRENT_FARM_PAIR, item);
          }
        });
      }
      let p = [];
      let pairsData = {};
      let pairs = [];
      Object.keys(data).forEach((item) => {
        if (item !== 'blockHeight') {
          pairs.push(item);
          p.push(pairApi.querySwapInfo(item));
        }
      });

      const datas_res = yield Promise.all(p);
      pairs.forEach((item, index) => {
        if (datas_res[index].code === 0) {
          pairsData[item] = datas_res[index].data;
        }
      });

      // let bsvPrice = 0;

      // const price_res = yield pairApi.querySwapInfo.call(pairApi, USDT_PAIR);

      // if (price_res.code === 0) {
      //   bsvPrice = BigNumber(price_res.data.swapToken2Amount)
      //     .div(price_res.data.swapToken1Amount)
      //     .multipliedBy(Math.pow(10, 8 - 6))
      //     .toString();
      // }

      yield put({
        type: 'saveFarm',
        payload: {
          allFarmPairs: data,
          currentFarmPair,
          // bsvPrice,
          pairsData,
        },
      });
      return {
        data,
        currentFarmPair,
      };
    },

    *updatePairData({ payload }, { call, put, select }) {
      // let { currentPair } = payload;
      const { userAddress } = yield select((state) => state.user.accountInfo);
      const res = yield farmApi.queryAllPairs.call(farmApi, userAddress);
      const { code, msg, data } = res;
      if (code !== 0) {
        return res;
      }

      // let bsvPrice = 0;
      // const price_res = yield pairApi.querySwapInfo.call(pairApi, USDT_PAIR);

      // if (price_res.code === 0) {
      //   bsvPrice = BigNumber(price_res.data.swapToken2Amount)
      //     .div(price_res.data.swapToken1Amount)
      //     .multipliedBy(Math.pow(10, 8 - 6))
      //     .toString();
      // }

      yield put({
        type: 'saveFarm',
        payload: {
          allFarmPairs: data,
          // bsvPrice,
        },
      });

      // console.log(data)
      return data;
    },

    *reqSwap({ payload }, { call, put }) {
      payload.source = TSWAP_SOURCE;
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
      let { allFarmPairs } = action.payload;
      let { currentFarmPair } = action.payload;
      if (!currentFarmPair) currentFarmPair = state.currentFarmPair;
      if (!currentFarmPair) {
        return {
          ...state,
          ...action.payload,
        };
      }
      let token = {},
        lockedTokenAmount = 0,
        rewardToken = {};
      if (!allFarmPairs) {
        allFarmPairs = state.allFarmPairs;
      }
      if (allFarmPairs[currentFarmPair]) {
        const currentPairObj = allFarmPairs[currentFarmPair];
        token = currentPairObj.token;
        lockedTokenAmount = currentPairObj.lockedTokenAmount;
        rewardToken = currentPairObj.rewardToken;
      }

      const pairName = currentFarmPair.toUpperCase().split('-');
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
