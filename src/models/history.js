import historyApi from '../api/history';
import { USDT_PAIR } from 'common/const';
import debug from 'debug';
const log = debug('history');

export default {
  namespace: 'history',

  state: {
    history: {},
  },

  subscriptions: {
    async setup({ dispatch, history }) {},
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { type } = payload;
      const currentPair = yield select((state) => state.pair.currentPair);
      if (!currentPair) {
        return [];
      }

      const res = yield historyApi.query.call(historyApi, payload);

      if (res.code === 0) {
        const newData = [...res.data].reverse();

        let time = [],
          price = [],
          amount = [],
          volumn = [];
        if (newData.length > 0) {
          if (type === 'pool') {
            newData.forEach((item, index) => {
              const { outToken1Amount, timestamp } = item;
              amount.push(
                formatAmount((outToken1Amount / Math.pow(10, 8)) * 2, 8),
              );
              time.push(formatTime(timestamp * 1000));
            });
          } else {
            newData.forEach((item, index) => {
              const { minPrice, maxPrice, token1Volume, timestamp } = item;
              let _price =
                (minPrice + maxPrice) / 2 / Math.pow(10, 8 - token2.decimal);
              if (currentPair === USDT_PAIR) {
                _price = 1 / _price;
                price.push(formatAmount(_price, 6));
              } else {
                price.push(formatAmount(_price, 8));
              }

              volumn.push(
                formatAmount((token1Volume / Math.pow(10, 8)) * 2, 8),
              );

              time.push(formatTime(timestamp * 1000));
            });
          }
        }

        return [price, amount, volumn, time];
      }

      return res;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    // saveData(state, action) {
    //   const { currentPair, data, type } = action.payload;
    //   let { history } = state;
    //   if (!history[currentPair]) {
    //     history[currentPair] = [];
    //   }
    //   history[currentPair][type] = data;
    //   return {
    //     ...state,
    //     history,
    //   };
    // },
  },
};
