import bsv from 'lib/webWallet';
import { formatSat } from 'common/utils';
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
  },

  subscriptions: {},

  effects: {
    *loadingUserData({ payload }, { call, put }) {
      // yield bsv.requestAccount().then();
      // console.log(bsv.getAccount, bsv.getAccount())
      let accountInfo;
      try {
        accountInfo = yield bsv.getAccount();
      } catch (error) {
        console.log(error);
        return { msg: error };
      }
      if (!accountInfo) return false;
      localStorage.setItem('TSwapNetwork', accountInfo.network);

      const bsvBalance = yield bsv.getBsvBalance();
      const userAddress = yield bsv.getAddress();
      const tokenBalance = yield bsv.getSensibleFtBalance();
      const userBalance = {
        BSV: formatSat(bsvBalance.balance),
      };
      tokenBalance.forEach((item) => {
        userBalance[item.genesis] = formatSat(item.balance, item.tokenDecimal);
      });
      log('userData:', accountInfo, tokenBalance, userBalance, userAddress);

      yield put({
        type: 'save',
        payload: {
          accountInfo,
          userBalance,
          userAddress,
          isLogin: true,
        },
      });
      return {};
    },
    *updateUserData({ payload }, { call, put }) {
      // yield bsv.requestAccount().then();
      // console.log(bsv.getAccount, bsv.getAccount())
      let accountInfo;
      try {
        accountInfo = yield bsv.getAccount();
      } catch (error) {
        console.log(error);
        return { msg: error };
      }
      if (!accountInfo) return false;
      localStorage.setItem('TSwapNetwork', accountInfo.network);

      const bsvBalance = yield bsv.getBsvBalance();
      const userAddress = yield bsv.getAddress();
      const tokenBalance = yield bsv.getSensibleFtBalance();
      const userBalance = {
        BSV: formatSat(bsvBalance.balance),
      };
      tokenBalance.forEach((item) => {
        userBalance[item.genesis] = formatSat(item.balance, item.tokenDecimal);
      });

      yield put({
        type: 'save',
        payload: {
          accountInfo,
          userBalance,
          userAddress,
          isLogin: true,
        },
      });
      return {};
    },
    *disconnectWebWallet({ payload }, { call, put }) {
      // console.log(bsv.exitAccount)
      try {
        yield bsv.exitAccount();
      } catch (error) {
        console.log(error);
        return { msg: error };
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
      try {
        const res = yield bsv.requestAccount().then();
        // console.log(res);
      } catch (error) {
        return { msg: error };
      }
    },

    *transferBsv({ payload }, { call, put }) {
      const { address, amount } = payload;

      log('transferBsv:', payload);
      try {
        const res = yield bsv.transferBsv({
          receivers: [
            {
              address,
              amount,
            },
          ],
        });
        log(res);
        return res;
      } catch (error) {
        console.log(error);
        return { msg: error, txid: '' };
      }
    },

    *transferFtTres({ payload }, { call, put }) {
      const { address, amount, codehash, genesishash } = payload;
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
        const res = yield bsv.transferSensibleFt({
          receivers: [
            {
              address,
              amount,
            },
          ],
          codehash,
          genesis: genesishash,
        });
        log(res);
        return res;
      } catch (error) {
        console.log(error);
        return { msg: error, txid: '' };
      }
    },

    *transferAll({ payload }, { call, put }) {
      const { datas } = payload;
      // console.log(...datas)
      try {
        const res = yield bsv.transferAll(datas);
        // console.log(res)
        log(res);
        return res;
      } catch (error) {
        console.log(error);
        return { msg: error };
      }
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
