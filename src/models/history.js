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
      const { index } = payload;
      if (
        his[currentPair] &&
        his[currentPair][index] &&
        his[currentPair][index].length > 0
      ) {
        return his[currentPair][index];
      }

      const res = yield historyApi.query.call(historyApi, payload);
      console.log('query:', res.data);

      if (res.code === 0) {
        yield put({
          type: 'saveData',
          payload: {
            data: res.data.reverse(),
            index,
            currentPair,
          },
        });
        return res.data;
      }

      return res;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    saveData(state, action) {
      const { currentPair, data, index } = action.payload;
      let { history } = state;
      if (!history[currentPair]) {
        history[currentPair] = [];
      }
      history[currentPair][index] = data;
      return {
        ...state,
        history,
      };
    },
  },
};
