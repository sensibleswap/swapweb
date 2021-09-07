import historyApi from '../api/history';
import debug from 'debug';
import { select } from '../i18n/locales/zh-ch';
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
      const currentPair = yield select((state) => state.pair.currentPair);
      if (!currentPair) {
        return [];
      }
      const his = yield select((state) => state.history.history);
      const { type = 'swap' } = payload;
      if (
        his[currentPair] &&
        his[currentPair][type] &&
        his[currentPair][type].length > 0
      ) {
        return his[currentPair][type];
      }

      const res = yield historyApi.query.call(historyApi, payload);
      const newData = [...res.data].reverse();

      if (res.code === 0) {
        yield put({
          type: 'saveData',
          payload: {
            data: newData,
            currentPair,
            type,
          },
        });
        return newData;
      }

      return res;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    saveData(state, action) {
      const { currentPair, data, type } = action.payload;
      let { history } = state;
      if (!history[currentPair]) {
        history[currentPair] = [];
      }
      history[currentPair][type] = data;
      return {
        ...state,
        history,
      };
    },
  },
};
