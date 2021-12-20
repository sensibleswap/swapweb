// import bsv from 'common/walletFun';
import {
  TSWAP_NETWORK,
  DEFAULT_NET,
  TSWAP_LAST_WALLET_TYPE,
} from 'common/const';
import Wallet from '../lib/main';
import debug from 'debug';
const log = debug('user');
const { localStorage } = window;

export default {
  namespace: 'user',

  state: {
    isLogin: false,
    accountInfo: {
      userBalance: {},
    },
    walletType: 1,
  },

  subscriptions: {},

  effects: {
    *loadingUserData({ payload }, { call, put, select }) {
      let { type } = payload;
      if (!type) {
        type = yield select((state) => state.user.walletType) || 1;
      }
      try {
        const _wallet = Wallet({ type });
        const accountInfo = yield _wallet.info();

        localStorage.setItem(TSWAP_NETWORK, accountInfo.network || DEFAULT_NET);

        log('userData:', accountInfo);

        yield put({
          type: 'save',
          payload: {
            accountInfo,
            walletType: type || 1,
          },
        });
      } catch (error) {
        console.log(error.toString());
        return { msg: error.toString() };
      }

      return {};
    },

    *updateUserData({ payload }, { call, put, select }) {
      const type = yield select((state) => state.user.walletType);
      try {
        const _wallet = Wallet({ type });
        const accountInfo = yield _wallet.info();
        localStorage.setItem(TSWAP_NETWORK, accountInfo.network || DEFAULT_NET);

        yield put({
          type: 'save',
          payload: {
            accountInfo,
            // isLogin: true,
          },
        });
      } catch (error) {
        console.log(error.toString());
        return { msg: error.toString() };
      }

      return {};
    },

    *disconnectWebWallet({ payload }, { call, put, select }) {
      const type = yield select((state) => state.user.walletType);
      try {
        const _wallet = Wallet({ type });
        yield _wallet.exitAccount();
      } catch (error) {
        console.log(error);
        // return { msg: error.message || error.toString() };
      }

      yield put({
        type: 'save',
        payload: {
          accountInfo: {
            userBalance: {},
          },
          isLogin: false,
        },
      });
    },

    *connectWebWallet({ payload }, { call, put }) {
      const { type, network } = payload;
      let res;
      try {
        const _wallet = Wallet({ type });
        res = yield _wallet.connectAccount(network);
        // console.log(res);
      } catch (error) {
        console.log(error);
        return { msg: error.message || error.toString() };
      }
      localStorage.setItem(TSWAP_LAST_WALLET_TYPE, type);
      yield put({
        type: 'save',
        payload: {
          isLogin: true,
        },
      });
      return {};
    },

    *transferBsv({ payload }, { call, put, select }) {
      // const { address, amount, note, changeAddress, noBroadcast } = payload;
      const type = yield select((state) => state.user.walletType);

      log('transferBsv:', payload);
      try {
        const _wallet = Wallet({ type });
        const res = yield _wallet.transferBsv(payload);
        log(res);
        return res;
      } catch (error) {
        // console.log(error.toString())
        return { msg: error.message || error.toString(), txid: '' };
      }
    },

    *transferAll({ payload }, { call, put, select }) {
      // const { datas } = payload;
      const type = yield select((state) => state.user.walletType);
      // console.log(payload);
      try {
        const _wallet = Wallet({ type });
        const res = yield _wallet.transferAll(payload);
        // const res = yield bsv.transferAll(type, datas);
        // console.log(res);
        log(res);
        return res;
      } catch (error) {
        return { msg: error.message || error.toString() };
      }
    },

    *signTx({ payload }, { call, put, select }) {
      const type = yield select((state) => state.user.walletType);
      try {
        const _wallet = Wallet({ type });
        const res = yield _wallet.signTx(payload.datas);
        // const res = yield bsv.signTx(type, payload.datas);
        log(res);
        return res;
      } catch (error) {
        return { msg: error.message || error.toString() };
      }
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
