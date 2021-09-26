import bsv from 'common/walletFun';
import { TSWAP_NETWORK, DEFAULT_NET } from 'common/const';
import { strAbbreviation } from 'common/utils';
import debug from 'debug';
// import 'common/vconsole';
const log = debug('user');
const { localStorage } = window;

export default {
  namespace: 'user',

  state: {
    isLogin: false,
    accountInfo: {},
    userBalance: {},
    userAddress: '',
    changeAddress: '',
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
        const accountInfo = yield bsv.getAccountInfo(type);
        const bsvBalance = yield bsv.getBsvBalance(type);
        const userAddress = yield bsv.getAddress(type);
        const changeAddress = yield bsv.getChangeAddress(type);
        const tokenBalance = yield bsv.getSensibleFtBalance(type);
        if (type === 3) {
          accountInfo.network =
            parseInt(accountInfo.token_map_id) === 1 ? 'mainnet' : 'testnet';
        }
        const network =
          type === 2 ? yield bsv.getNetwork(type) : accountInfo.network;

        localStorage.setItem(TSWAP_NETWORK, network || DEFAULT_NET);

        const paymail = yield bsv.getPaymail();

        const userBalance = {
          BSV: bsvBalance,
          ...tokenBalance,
        };
        log(
          'userData:',
          accountInfo,
          network,
          tokenBalance,
          userBalance,
          userAddress,
          changeAddress,
        );

        yield put({
          type: 'save',
          payload: {
            accountInfo,
            userBalance,
            userAddress: paymail || userAddress,
            userAddressShort: paymail || strAbbreviation(userAddress, [7, 7]),
            changeAddress,
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
      const type = yield select((state) => state.user.walletType);
      try {
        const accountInfo = yield bsv.getAccountInfo(type);
        const bsvBalance = yield bsv.getBsvBalance(type);
        const userAddress = yield bsv.getAddress(type);
        const changeAddress =
          type === 3 ? yield bsv.getChangeAddress(type) : '';
        const tokenBalance = yield bsv.getSensibleFtBalance(type);
        const network =
          type === 1 ? accountInfo.network : yield bsv.getNetwork(type);

        const paymail = type === 3 ? accountInfo.email : yield bsv.getPaymail();
        localStorage.setItem(TSWAP_NETWORK, network || DEFAULT_NET);

        const userBalance = {
          BSV: bsvBalance,
          ...tokenBalance,
        };

        yield put({
          type: 'save',
          payload: {
            accountInfo,
            userBalance,
            userAddress,
            userAddressShort: paymail || strAbbreviation(userAddress, [7, 7]),
            changeAddress,
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
      try {
        yield bsv.exitAccount();
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
      const { type, network } = payload;
      let res;
      try {
        res = yield bsv.connectWallet(type, network);
      } catch (error) {
        return { msg: error.message || error.toString() };
      }
      return {};
    },

    *transferBsv({ payload }, { call, put, select }) {
      const { address, amount, note, changeAddress, noBroadcast } = payload;
      const type = yield select((state) => state.user.walletType);

      log('transferBsv:', payload);
      try {
        const res = yield bsv.transferBsv(
          type,
          { address, amount, note, changeAddress },
          noBroadcast,
        );
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

    *signTx({ payload }, { call, put, select }) {
      const type = yield select((state) => state.user.walletType);
      try {
        const res = yield bsv.signTx(type, payload.datas);
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
