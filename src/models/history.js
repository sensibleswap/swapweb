import historyApi from '../api/history';
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
    *query({ payload }, { call, put }) {
      const res = yield historyApi.query.call(historyApi, payload);
      log('query:', res);

      yield put({
        type: 'save',
        payload: {},
      });
      return res;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
