'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { gzip } from 'node-gzip';
import EventBus from 'common/eventBus';
import { Button, message } from 'antd';
import Rate from 'components/rate';
import Loading from 'components/loading';
import { BtnWait } from 'components/btns';
import TokenLogo from 'components/tokenicon';
import FormatNumber from 'components/formatNumber';
import FarmPairIcon from 'components/pairIcon/farmIcon';
import { formatAmount, formatSat, LeastFee, formatTok } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';
import { SuccessResult } from 'components/result';
import { Arrow } from 'components/ui';

@connect(({ user, farm, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...farm,
    loading: effects['farm/getAllPairs'],
  };
})
export default class Deposit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // addLPRate: 0,
      addLP: 0,
      formFinish: false,
      blockHeight: 0,
    };
  }

  componentDidMount() {
    EventBus.on('changeFarmPair', () => {
      this.changeData(0);
      this.clear();
    });
  }

  clear = () => {
    this.setState({
      formFinish: false,
      addLP: 0,
    });
  };

  updateData() {
    const { dispatch, accountInfo } = this.props;
    const { userAddress } = accountInfo;
    dispatch({
      type: 'farm/getAllPairs',
      payload: {
        address: userAddress,
      },
    });
    dispatch({
      type: 'user/loadingUserData',
      payload: {},
    });
  }

  changeData = (value) => {
    this.setState({
      addLP: value,
    });
  };

  renderForm() {
    const {
      currentFarmPair,
      loading,
      submiting,
      accountInfo,
      lptoken,
      rewardToken,
      pairsData,
      allFarmPairs,
    } = this.props;
    if (!currentFarmPair) return null;
    const { tokenID } = lptoken;
    if (loading || !currentFarmPair || !pairsData[tokenID]) return <Loading />;
    if (!pairsData[tokenID]) return null;
    const balance = accountInfo.userBalance[tokenID] || 0;
    const currentPairData = pairsData[tokenID] || {};
    const {
      swapToken1Amount,
      swapToken2Amount,
      token1,
      token2,
    } = currentPairData;
    const bsv_amount = formatSat(swapToken1Amount, token1.decimal);
    const token_amount = formatSat(swapToken2Amount, token2.decimal);
    const price = formatAmount(token_amount / bsv_amount, token2.decimal);
    return (
      <div className={styles.content}>
        <Rate
          type="farm"
          changeAmount={this.changeData}
          balance={balance}
          tokenPair={<FarmPairIcon keyword="pair" />}
        />
        <Arrow />

        <div className={styles.title}>{_('earn')}</div>
        <div
          className={styles.pair_box}
          style={{ paddingLeft: 15, paddingRight: 17 }}
        >
          <div className={styles.pair_left}>
            <div className={styles.icon} style={{ marginRight: 10 }}>
              <TokenLogo
                name={rewardToken.symbol}
                genesisID={rewardToken.tokenID}
                size={25}
              />
            </div>
            <div className={styles.name} style={{ fontSize: 22 }}>
              {rewardToken.symbol}
            </div>
          </div>
          <div className={styles.pair_right}>
            <FormatNumber value={allFarmPairs[currentFarmPair]._yield} />%{' '}
            {_('apy')}
          </div>
        </div>

        <div className={styles.price}>
          1 {token1.symbol.toUpperCase()} = {price}{' '}
          {token2.symbol.toUpperCase()}
        </div>

        {this.renderButton()}
      </div>
    );
  }

  handleSubmit = async () => {
    const { addLP } = this.state;
    const { dispatch, currentFarmPair, lptoken, accountInfo } = this.props;
    const { userAddress, userBalance, changeAddress } = accountInfo;

    let res = await dispatch({
      type: 'farm/reqSwap',
      payload: {
        symbol: currentFarmPair,
        address: userAddress,
        op: 1,
      },
    });

    if (res.code) {
      return message.error(res.msg);
    }

    const { tokenToAddress, requestIndex, bsvToAddress, txFee } = res.data;

    const isLackBalance = LeastFee(txFee, userBalance.BSV);
    if (isLackBalance.code) {
      return message.error(isLackBalance.msg);
    }

    const _value = formatTok(addLP, lptoken.decimal);
    // console.log(_value, formatTok(addLP, lptoken.decimal))
    let tx_res = await dispatch({
      type: 'user/transferAll',
      payload: {
        datas: [
          {
            type: 'bsv',
            address: bsvToAddress,
            amount: txFee,
            changeAddress,
            note: 'tswap.io(farm deposit)',
          },
          {
            type: 'sensibleFt',
            address: tokenToAddress,
            amount: _value,
            changeAddress,
            codehash: lptoken.codeHash,
            genesis: lptoken.tokenID,
            rabinApis: lptoken.rabinApis,
            note: 'tswap.io(farm deposit)',
          },
        ],
        noBroadcast: true,
      },
    });
    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }

    if (tx_res.list) {
      tx_res = tx_res.list;
    }
    if (!tx_res[0] || !tx_res[0].txHex || !tx_res[1] || !tx_res[1].txHex) {
      return message.error(_('txs_fail'));
    }

    let data = {
      symbol: currentFarmPair,
      requestIndex: requestIndex,
      bsvRawTx: tx_res[0].txHex,
      bsvOutputIndex: 0,
      tokenRawTx: tx_res[1].txHex,
      tokenOutputIndex: 0,
      amountCheckRawTx: tx_res[1].routeCheckTxHex,
    };
    data = JSON.stringify(data);
    data = await gzip(data);
    const deposit_res = await dispatch({
      type: 'farm/deposit',
      payload: {
        data,
      },
    });
    if (!deposit_res.code && deposit_res.data.txid) {
      message.success('success');
      this.updateData();
      this.setState({
        formFinish: true,
        blockHeight: deposit_res.data.blockHeight,
      });
    } else {
      return message.error(deposit_res.msg);
    }
  };

  renderButton() {
    const {
      isLogin,
      accountInfo,
      lptoken,
      allFarmPairs,
      currentFarmPair,
    } = this.props;

    const { addLP } = this.state;
    const LP = accountInfo.userBalance[lptoken.tokenID];

    const conditions = [
      { key: 'login', cond: !isLogin },
      { key: 'enterAmount', cond: parseFloat(addLP) <= 0 },
      {
        key: 'lackBalance',
        cond: parseFloat(addLP) > parseFloat(LP),
      },
    ];

    if (allFarmPairs[currentFarmPair].abandoned) {
      return (
        <Button
          className={styles.btn}
          type="primary"
          shape="round"
          disabled={true}
        >
          {_('deposit_earn')}
        </Button>
      );
    }

    return (
      BtnWait(conditions) || (
        <Button
          className={styles.btn}
          type="primary"
          shape="round"
          onClick={this.handleSubmit}
        >
          {_('deposit_earn')}
        </Button>
      )
    );
  }

  renderResult() {
    const { addLP, blockHeight } = this.state;
    return (
      <div className={styles.content}>
        <SuccessResult
          success_txt={`${_('deposit_success')}@block${blockHeight}`}
          done={this.clear}
        >
          <>
            <div className={styles.small_title}>{_('deposited')}</div>

            <div className={styles.pair_data}>
              <div className={styles.pair_left}>
                <FormatNumber value={addLP} />
              </div>
              <div className={styles.pair_right}>
                <FarmPairIcon keyword="pair" size={20} />
              </div>
            </div>
          </>
        </SuccessResult>
      </div>
    );
  }

  render() {
    const { formFinish } = this.state;
    if (formFinish) {
      return this.renderResult();
    }
    return this.renderForm();
  }
}
