import historyApi from '../api/history';
import { USDT_PAIR } from 'common/const';
import { message } from 'antd';
import { formatTime, formatAmount, getTimeAgo } from 'common/utils';
import debug from 'debug';
const log = debug('history');

export default {
  namespace: 'history',

  state: {
    timeRange: '1w', // '4h' | '1d' | '1w' | '1m' | 'all'
  },

  subscriptions: {
    async setup({ dispatch, history }) {},
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const currentPair = yield select((state) => state.pair.currentPair);
      const timeRange = yield select((state) => state.history.timeRange);

      if (!currentPair) {
        return [];
      }
      const allPairs = yield select((state) => state.pair.allPairs);
      const { swapCodeHash, swapID, token2 } = allPairs[currentPair];

      const { type } = payload;
      const res = yield historyApi.query.call(historyApi, {
        codeHash: swapCodeHash,
        genesisHash: swapID,
        currentPair,
        type,
      });

      if (!res || res.code) {
        console.log(res.msg);
        return [];
      }
      const newData = [...res.data].reverse();

      const dataTimeline = [];

      if (newData.length > 0) {
        const startTimestamp = getTimeAgo(timeRange);

        if (type === 'pool') {
          newData.forEach((item, i) => {
            const { outToken1Amount, timestamp } = item;
            if (i > 0 && (!startTimestamp || timestamp > startTimestamp)) {
              dataTimeline.push({
                timestamp: timestamp * 1000,
                formattedTime: formatTime(timestamp * 1000),
                amount: formatAmount(
                  (outToken1Amount / Math.pow(10, 8)) * 2,
                  8,
                ),
              });
            }
          });
        } else {
          newData.forEach((item, i) => {
            const { minPrice, maxPrice, token1Volume, timestamp } = item;
            if (i > 0 && (!startTimestamp || timestamp > startTimestamp)) {
              const stepData = {
                timestamp: timestamp * 1000,
                formattedTime: formatTime(timestamp * 1000),
                volumn: formatAmount((token1Volume / Math.pow(10, 8)) * 2, 8),
              };

              let _price =
                (minPrice + maxPrice) / 2 / Math.pow(10, 8 - token2.decimal);
              if (currentPair === USDT_PAIR) {
                _price = 1 / _price;
                stepData.price = formatAmount(_price, 6);
              } else {
                stepData.price = formatAmount(_price, 8);
              }

              dataTimeline.push(stepData);
            }
          });
        }
      }

      return dataTimeline;
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
