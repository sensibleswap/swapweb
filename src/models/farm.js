// import BigNumber from 'bignumber.js';
import farmApi from '../api/farm';
import pairApi from '../api/pair';
import { TSWAP_CURRENT_FARM_PAIR, TSWAP_SOURCE } from 'common/const';
import { formatSat, getCurrentPair } from 'common/utils';
import { handleFarmData } from 'common/farmUtils';
import debug from 'debug';
const log = debug('farm');

export default {
  namespace: 'farm',

  state: {
    allFarmPairs: [],
    allFarmPairsArr: [],
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
    *getAllPairs({ payload }, { call, put, select }) {
      const res = yield farmApi.queryAllPairs.call(farmApi, payload.address);
      log('farmApi:', res);
      let { data } = res;

      if (res.code !== 0) {
        console.log(res.msg);
        return res;
      }

      let currentFarmPair = getCurrentPair('farm');
      if (!currentFarmPair || !data[currentFarmPair]) {
        Object.keys(data).forEach((item) => {
          if (item !== 'blockHeight') {
            currentFarmPair = item;
            // console.log('localstorage.set:', item)
            localStorage.setItem(TSWAP_CURRENT_FARM_PAIR, item);
          }
        });
      }
      let p = [];
      let pairsData = {};
      let pairs = [];
      // farmPairs = [];
      Object.keys(data).forEach((item) => {
        if (item !== 'blockHeight') {
          pairs.push(item);
          // farmPairs.push({ ...data[item], pairName: item });
          p.push(pairApi.querySwapInfo(item));
        }
      });
      const datas_res = yield Promise.all(p);
      pairs.forEach((item, index) => {
        if (datas_res[index].code === 0) {
          pairsData[item] = datas_res[index].data;
        }
      });
      const { allPairs, bsvPrice } = yield select((state) => state.pair);
      let { allFarmData, allFarmArr } = handleFarmData(
        data,
        allPairs,
        pairsData,
        bsvPrice,
      );
      // console.log(allFarmData, allFarmArr)

      yield put({
        type: 'saveFarm',
        payload: {
          allFarmPairs: allFarmData,
          allFarmPairsArr: allFarmArr,
          currentFarmPair,
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

      let farmPairs = [];
      Object.keys(data).forEach((item) => {
        if (item !== 'blockHeight') {
          farmPairs.push({ ...data[item], pairName: item });
        }
      });
      const { allPairs, bsvPrice } = yield select((state) => state.pair);
      const { pairsData } = yield select((state) => state.farm);
      let { allFarmData, allFarmArr } = handleFarmData(
        data,
        allPairs,
        pairsData,
        bsvPrice,
      );
      // console.log(allFarmData)

      yield put({
        type: 'saveFarm',
        payload: {
          allFarmPairs: allFarmData,
          allFarmPairsArr: allFarmArr,
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
