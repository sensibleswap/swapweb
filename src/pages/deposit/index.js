'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { gzip } from 'node-gzip';
import EventBus from 'common/eventBus';
import { Button, Spin, message } from 'antd';
import Rate from 'components/rate';
import CustomIcon from 'components/icon';
import Loading from 'components/loading';
import { BtnWait } from 'components/btns';
import TokenLogo from 'components/tokenicon';
import FormatNumber from 'components/formatNumber';
import FarmPairIcon from 'components/pairIcon/farmIcon';
import { formatAmount, formatSat, LeastFee, formatTok } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';

@connect(({ pair, user, farm, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    ...user,
    ...farm,
    loading: effects['farm/getAllPairs'] || effects['pair/getAllPairs'],
    submiting:
      effects['farm/reqSwap'] ||
      effects['farm/deposit'] ||
      effects['user/transferAll'] ||
      false,
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
      symbol1,
      symbol2,
      lptoken,
      rewardToken,
      pairsData,
      allPairs = {},
      allFarmPairs,
    } = this.props;
    if (loading || !currentFarmPair || !pairsData[currentFarmPair])
      return <Loading />;
    if (!allPairs[currentFarmPair]) return null;
    const balance = accountInfo.userBalance[lptoken.tokenID] || 0;
    const currentPairData = pairsData[currentFarmPair] || {};
    const { token1, token2 } = allPairs[currentFarmPair];
    const { swapToken1Amount, swapToken2Amount } = currentPairData;
    const bsv_amount = formatSat(swapToken1Amount, token1.decimal);

    // const { decimal } = allPairs[currentFarmPair]
    //   ? token2
    //   : 8;
    const token_amount = formatSat(swapToken2Amount, token2.decimal);
    const price = formatAmount(token_amount / bsv_amount, token2.decimal);
    return (
      <div className={styles.content}>
        <Spin spinning={submiting}>
          <Rate
            type="farm"
            changeAmount={this.changeData}
            balance={balance}
            tokenPair={<FarmPairIcon keyword="pair" />}
          />

          <div className={styles.switch_icon}>
            <div className={styles.icon} onClick={this.switch}>
              <CustomIcon type="iconArrow2" style={{ fontSize: 14 }} />
            </div>
            <div className={styles.line}></div>
          </div>

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
            1 {symbol1} = {price} {symbol2}
          </div>

          {this.renderButton()}
        </Spin>
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

    // const _value = BigNumber(addLP)
    //   .multipliedBy(Math.pow(10, lptoken.decimal))
    //   .toFixed(0);
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
    const { isLogin, accountInfo, lptoken } = this.props;
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
        <div className={styles.finish_logo}>
          <CustomIcon
            type="iconicon-success"
            style={{ fontSize: 64, color: '#2BB696' }}
          />
        </div>
        <div className={styles.finish_title}>
          {_('deposit_success')}@block{blockHeight}
        </div>
        <div className={styles.small_title}>{_('deposited')}</div>

        <div className={styles.pair_data}>
          <div className={styles.pair_left}>
            <FormatNumber value={addLP} />
          </div>
          <div className={styles.pair_right}>
            <FarmPairIcon keyword="pair" size={20} />
          </div>
        </div>

        <Button
          type="primary"
          shape="round"
          className={styles.done_btn}
          onClick={this.clear}
        >
          {_('done')}
        </Button>
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
