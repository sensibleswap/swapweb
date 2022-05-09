import stakeApi from '../api/stake';
import { LeastFee, formatSat } from 'common/utils';
import { gzip } from 'node-gzip';
// import { leftTime } from '../common/utils';

export default {
  namespace: 'stake',

  state: {
    allStakePairs: [],
    stakePairInfo: {},
    currentStakePair: '',
    pairData: {},
    userPairData: {},
  },

  subscriptions: {
    async setup({ dispatch, history }) {},
  },

  effects: {
    *getAllPairs({ payload }, { call, put, select }) {
      const allpairs_res = yield stakeApi.queryAllPairs.call(
        stakeApi,
        payload.address,
      );
      // console.log(res);
      let allPairs = [];
      if (allpairs_res.code === 0) {
        const { data } = allpairs_res;
        Object.keys(data).forEach((item) => {
          if (item !== 'blockHeight') {
            allPairs.push({ ...data[item], name: item });
          }
        });
        let _stakePairInfo = allPairs[0];
        let currrentPair = _stakePairInfo.name;
        // console.log(allPairs, currrentPair);
        const pairinfo_res = yield stakeApi.queryStakeInfo.call(
          stakeApi,
          currrentPair,
        );
        // console.log(pairinfo_res);
        let _pairData = {};
        if (pairinfo_res.code === 0) {
          _pairData = pairinfo_res.data;
        }
        yield put({
          type: 'save',
          payload: {
            allStakePairs: allPairs,
            currentStakePair: currrentPair,
            stakePairInfo: _stakePairInfo,
            pairData: _pairData,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            stakePairInfo: { msg: allpairs_res.message },
          },
        });
      }
    },
    *getUserStakeInfo({ payload }, { call, put, select }) {
      const { currentStakePair, stakePairInfo } = yield select(
        (state) => state.stake,
      );
      const { accountInfo } = yield select((state) => state.user);
      // console.log(currentStakePair, accountInfo);
      if (!accountInfo.userAddress || !currentStakePair) return;
      const res = yield stakeApi.queryUserInfo.call(
        stakeApi,
        currentStakePair,
        accountInfo.userAddress,
      );
      // console.log(res);
      let _userPairData = {};
      if (res.code === 0) {
        //"unlockingTokens": [{"expired":737212,"amount":"100000"}]
        const { unlockingTokens, lastRewardBlock } = res.data;
        const { decimal } = stakePairInfo.token;
        let arr = [];
        if (unlockingTokens && unlockingTokens.length > 0) {
          unlockingTokens.forEach((item) => {
            const { expired, amount } = item;
            const _amount = formatSat(amount, decimal);
            let left = parseInt(expired) - parseInt(lastRewardBlock);
            if (left <= 0) left = 0;
            const freeIndex = arr.findIndex((v) => v.left === left);
            if (freeIndex > -1) {
              arr[freeIndex]._amount =
                parseFloat(arr[freeIndex]._amount) + parseFloat(_amount);
            } else {
              arr.push({
                left,
                amount,
                _amount,
              });
            }
          });
        }

        res.data.unlockingTokens_user = arr;
        // console.log(arr)
        _userPairData = res.data;
      }
      yield put({
        type: 'save',
        payload: {
          userPairData: _userPairData,
        },
      });
    },
    *updateStakeInfo({ payload }, { call, put, select }) {
      const { currentStakePair } = yield select((state) => state.stake);
      const pairinfo_res = yield stakeApi.queryStakeInfo.call(
        stakeApi,
        currentStakePair,
      );
      // console.log(pairinfo_res);
      let _pairData = {};
      if (pairinfo_res.code === 0) {
        _pairData = pairinfo_res.data;
      }
      yield put({
        type: 'save',
        payload: {
          pairData: _pairData,
        },
      });
    },
    *reqStake({ payload }, { call, put, select }) {
      const { op } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      const { accountInfo } = yield select((state) => state.user);
      const { userAddress, userBalance } = accountInfo;
      // console.log(currentStakePair, accountInfo);
      const req = yield stakeApi.reqStake.call(stakeApi, {
        symbol: currentStakePair,
        address: userAddress,
        op,
        source: 'tswap.io',
      });
      // console.log(req);

      if (req.code) {
        return {
          msg: req.msg,
        };
      }

      // const { tokenToAddress, requestIndex, bsvToAddress, txFee } = req.data;

      const isLackBalance = LeastFee(req.data.txFee, userBalance.BSV);
      if (isLackBalance.code) {
        return {
          msg: isLackBalance.msg,
        };
      }
      return req.data;
    },
    *deposit({ payload }, { call, put, select }) {
      const { requestIndex, data } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      let liq_data = {
        symbol: currentStakePair,
        requestIndex: requestIndex,
        bsvRawTx: data[0].txHex,
        bsvOutputIndex: 0,
        tokenRawTx: data[1].txHex,
        tokenOutputIndex: 0,
        amountCheckRawTx: data[1].routeCheckTxHex,
      };
      liq_data = JSON.stringify(liq_data);
      liq_data = yield gzip(liq_data);
      const res = yield stakeApi.deposit.call(stakeApi, { data: liq_data });
      // console.log(res);
      if (res.code) {
        return {
          msg: res.msg,
        };
      }
      return res.data;
    },
    *unlock({ payload }, { call, put, select }) {
      const { requestIndex, data, tokenRemoveAmount } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      let liq_data = {
        symbol: currentStakePair,
        requestIndex: requestIndex,
        bsvRawTx: data[0].txHex,
        bsvOutputIndex: 0,
        tokenRemoveAmount,
      };
      liq_data = JSON.stringify(liq_data);
      liq_data = yield gzip(liq_data);
      const res = yield stakeApi.unlock.call(stakeApi, { data: liq_data });
      // console.log(res);
      if (res.code) {
        return {
          msg: res.msg,
        };
      }
      return res.data;
    },
    *unlock2({ payload }, { call, put, select }) {
      const { requestIndex, pubKey, sig } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      let params = {
        symbol: currentStakePair,
        requestIndex: requestIndex,
        pubKey,
        sig,
      };
      const res = yield stakeApi.unlock2.call(stakeApi, params);
      // console.log(res);
      // if (res.code) {
      //     return {
      //         msg: res.msg
      //     };
      // }
      return res.data;
    },
    *withdraw({ payload }, { call, put, select }) {
      const { requestIndex, data } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      let liq_data = {
        symbol: currentStakePair,
        requestIndex: requestIndex,
        bsvRawTx: data[0].txHex,
        bsvOutputIndex: 0,
      };
      liq_data = JSON.stringify(liq_data);
      liq_data = yield gzip(liq_data);
      const res = yield stakeApi.withdraw.call(stakeApi, { data: liq_data });
      // console.log(res);
      if (res.code) {
        return {
          msg: res.msg,
        };
      }
      return res.data;
    },
    *withdraw2({ payload }, { call, put, select }) {
      const { requestIndex, pubKey, sig } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      let params = {
        symbol: currentStakePair,
        requestIndex: requestIndex,
        pubKey,
        sig,
      };
      const res = yield stakeApi.withdraw2.call(stakeApi, params);
      // console.log(res);
      // if (res.code) {
      //     return {
      //         msg: res.msg
      //     };
      // }
      return res.data;
    },
    *harvest({ payload }, { call, put, select }) {
      const { requestIndex, data } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      let liq_data = {
        symbol: currentStakePair,
        requestIndex: requestIndex,
        bsvRawTx: data[0].txHex,
        bsvOutputIndex: 0,
      };
      liq_data = JSON.stringify(liq_data);
      liq_data = yield gzip(liq_data);
      const res = yield stakeApi.harvest.call(stakeApi, { data: liq_data });
      // console.log(res);
      if (res.code) {
        return {
          msg: res.msg,
        };
      }
      return res.data;
    },
    *harvest2({ payload }, { call, put, select }) {
      const { requestIndex, pubKey, sig } = payload;
      const { currentStakePair } = yield select((state) => state.stake);
      let params = {
        symbol: currentStakePair,
        requestIndex: requestIndex,
        pubKey,
        sig,
      };
      const res = yield stakeApi.harvest2.call(stakeApi, params);
      // console.log(res);
      // if (res.code) {
      //     return {
      //         msg: res.msg
      //     };
      // }
      return res.data;
    },
  },
  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
