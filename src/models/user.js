import bsv from 'lib/webWallet';
import { formatSat } from 'common/utils';

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
      const accountInfo = yield bsv.getAccount();
      if (!accountInfo) return false;

      const bsvBalance = yield bsv.getBsvBalance();
      const userAddress = yield bsv.getAddress();
      const tokenBalance = yield bsv.getSensibleFtBalance();
      const userBalance = {
        BSV: formatSat(bsvBalance.balance),
      };
      tokenBalance.forEach((item) => {
        userBalance[item.codehash] = formatSat(item.balance, item.tokenDecimal);
      });
      console.log(accountInfo, userBalance, userAddress);

      yield put({
        type: 'save',
        payload: {
          accountInfo,
          userBalance,
          userAddress,
          isLogin: true,
        },
      });
    },
    *connectWebWallet({ payload }, { call, put }) {
      const res = yield bsv.requestAccount().then();
      console.log(res);
    },

    *transferBsv({ payload }, { call, put }) {
      const { address, amount } = payload;

      console.log(payload);
      try {
        const res = yield bsv.transferBsv({
          receivers: [
            {
              address,
              amount,
            },
          ],
        });
        console.log(res);
        return res;
      } catch (error) {
        console.log(error);
        return { msg: error };
      }
    },

    *transferFtTres({ payload }, { call, put }) {
      const { address, amount, codehash, genesis } = payload;

      console.log(payload);
      try {
        const res = yield bsv.transferSensibleFt({
          receivers: [
            {
              address,
              amount,
            },
          ],
          codehash,
          genesis,
        });
        console.log(res);
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
