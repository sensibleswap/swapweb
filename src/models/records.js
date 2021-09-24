import recordsApi from '../api/records';
import { USDT_PAIR } from 'common/const';
import { formatTime, formatAmount, parseUrl, getTimeAgo } from 'common/utils';
import debug from 'debug';
const log = debug('records');

export default {
  namespace: 'records',

  state: {
    timeRange: '1w', // '4h' | '1d' | '1w' | '1m' | 'all'
  },

  subscriptions: {
    async setup({ dispatch, history }) {},
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const allPairs = yield select((state) => state.pair.allPairs);

      const urlPair = parseUrl(allPairs);

      let currentPair;
      if (urlPair) {
        currentPair = urlPair;
      } else {
        currentPair = yield select((state) => state.pair.currentPair);
      }

      if (!currentPair) {
        return [];
      }
      const timeRange = yield select((state) => state.records.timeRange);
      const { swapCodeHash, swapID, token2 } = allPairs[currentPair];

      const { type } = payload;
      const res = yield recordsApi.query.call(recordsApi, {
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
            const { closeAmount, timestamp } = item;
            if (i > 0 && (!startTimestamp || timestamp > startTimestamp)) {
              dataTimeline.push({
                timestamp: timestamp * 1000,
                formattedTime: formatTime(timestamp * 1000),
                amount: formatAmount((closeAmount / Math.pow(10, 8)) * 2, 8),
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
  },
};