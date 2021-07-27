import bsv from 'common/walletFun';
import { TSWAP_NETWORK, DEFAULT_NET } from 'common/const';
import { strAbbreviation } from 'common/utils';
import debug from 'debug';
const log = debug('user');
const { localStorage } = window;

export default {
  namespace: 'user',

  state: {
    isLogin: false,
    accountInfo: {},
    userBalance: {},
    userAddress: '',
    walletType: 1,
  },

  subscriptions: {},

  effects: {
    *loadingUserData({ payload }, { call, put, select }) {
      // yield bsv.requestAccount().then();
      // console.log(bsv.getAccount, bsv.getAccount())
      let { type } = payload;
      if (!type) {
        type = yield select((state) => state.user.walletType) || 1;
      }
      let accountInfo;
      try {
        accountInfo = yield bsv.getAccountInfo(type);
      } catch (error) {
        // console.log(error);
        return { msg: error };
      }
      if (!accountInfo || !accountInfo.email) return false;
      localStorage.setItem(TSWAP_NETWORK, accountInfo.network || DEFAULT_NET);
      try {
        const bsvBalance = yield bsv.getBsvBalance(type);
        const userAddress = yield bsv.getAddress(type);
        const tokenBalance = yield bsv.getSensibleFtBalance(type);

        const paymail = yield bsv.getPaymail();
        const userBalance = {
          BSV: bsvBalance,
          ...tokenBalance,
        };
        log('userData:', accountInfo, tokenBalance, userBalance, userAddress);

        yield put({
          type: 'save',
          payload: {
            accountInfo,
            userBalance,
            userAddress: paymail || userAddress,
            userAddressShort: paymail || strAbbreviation(userAddress, [5, 4]),
            isLogin: true,
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
      // yield bsv.requestAccount().then();
      // console.log(bsv.getAccount, bsv.getAccount())
      let accountInfo;
      const type = yield select((state) => state.user.walletType);
      try {
        accountInfo = yield bsv.getAccountInfo(type);
      } catch (error) {
        // console.log(error);
        return { msg: error.message || error.toString() };
      }
      if (!accountInfo || !accountInfo.email) return false;
      localStorage.setItem(TSWAP_NETWORK, accountInfo.network || DEFAULT_NET);
      try {
        const bsvBalance = yield bsv.getBsvBalance(type);
        const userAddress = yield bsv.getAddress(type);
        const tokenBalance = yield bsv.getSensibleFtBalance(type);
        const paymail = yield bsv.getPaymail();

        const userBalance = {
          BSV: bsvBalance,
          ...tokenBalance,
        };

        yield put({
          type: 'save',
          payload: {
            accountInfo,
            userBalance,
            userAddress: paymail || userAddress,
            userAddressShort: paymail || strAbbreviation(userAddress, [5, 4]),
            isLogin: true,
          },
        });
      } catch (error) {
        console.log(error.toString());
        return { msg: error.toString() };
      }

      return {};
    },
    *disconnectWebWallet({ payload }, { call, put, select }) {
      // console.log(bsv.exitAccount)
      const type = yield select((state) => state.user.walletType);
      try {
        yield bsv.exitAccount(type);
      } catch (error) {
        // console.log(error);
        return { msg: error.message || error.toString() };
      }

      yield put({
        type: 'save',
        payload: {
          accountInfo: {},
          userBalance: {},
          userAddress: '',
          isLogin: false,
        },
      });
    },
    *connectWebWallet({ payload }, { call, put }) {
      const { type } = payload;
      try {
        yield bsv.connectWallet(type);
        return {};
      } catch (error) {
        return { msg: error.message || error.toString() };
      }
    },

    *transferBsv({ payload }, { call, put, select }) {
      const { address, amount } = payload;
      const type = yield select((state) => state.user.walletType);

      log('transferBsv:', payload);
      try {
        const res = yield bsv.transferBsv(type, { address, amount });
        log(res);
        return res;
      } catch (error) {
        // console.log(error.toString())
        return { msg: error.message || error.toString(), txid: '' };
      }
    },

    *transferFtTres({ payload }, { call, put, select }) {
      const { address, amount, codehash, genesishash } = payload;
      const type = yield select((state) => state.user.walletType);
      log('transferFtTres:', {
        receivers: [
          {
            address,
            amount,
          },
        ],
        codehash,
        genesis: genesishash,
      });
      try {
        const res = yield bsv.transferSensibleFt(type, {
          address,
          amount,
          codehash,
          genesis: genesishash,
        });
        log(res);
        return res;
      } catch (error) {
        // console.log(error);
        return { msg: error.message || error.toString(), txid: '' };
      }
    },

    *transferAll({ payload }, { call, put, select }) {
      const { datas } = payload;
      const type = yield select((state) => state.user.walletType);
      // console.log(...datas)
      try {
        const res = yield bsv.transferAll(type, datas);
        // console.log(res)
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
