'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { gzip } from 'node-gzip';
import { Slider, Button, Spin, message, Input } from 'antd';
import EventBus from 'common/eventBus';
import { formatAmount, formatSat } from 'common/utils';
import CustomIcon from 'components/icon';
import FormatNumber from 'components/formatNumber';
import Loading from 'components/loading';
import TokenPair from 'components/tokenPair';
import TokenLogo from 'components/tokenicon';
import styles from './index.less';
import _ from 'i18n';

import BigNumber from 'bignumber.js';

const datas = [
  {
    label: '25%',
    value: 25,
  },
  {
    label: '50%',
    value: 50,
  },
  {
    label: '75%',
    value: 75,
  },
  {
    label: _('max'),
    value: 100,
  },
];

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
      addLPRate: 0,
      addLP: 0,
      formFinish: false,
    };
  }

  componentDidMount() {
    EventBus.on('changeFarmPair', () => {
      this.changeData(0);
    });
  }

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

  changeData = (e) => {
    let value;
    if (e.target) {
      //输入框变化值
      const { accountInfo, lptoken } = this.props;
      const LP = accountInfo.userBalance[lptoken.tokenID] || 0;
      let _addLp = e.target.value;
      _addLp = formatAmount(_addLp, lptoken.decimal);
      if (_addLp <= 0) {
        value = 0;
      } else if (_addLp >= LP) {
        value = 100;
      } else {
        value = BigNumber(_addLp).div(LP).multipliedBy(100).toString();
      }
      return this.setState({
        addLP: _addLp,
        addLPRate: value,
      });
    }
    this.slideData(e);
  };

  slideData = (value) => {
    const { accountInfo, lptoken } = this.props;
    const LP = accountInfo.userBalance[lptoken.tokenID] || 0;
    this.setState({
      addLPRate: value,
      addLP: BigNumber(LP).multipliedBy(value).div(100).toString(),
    });
  };

  renderForm() {
    const {
      currentPair,
      loading,
      submiting,
      accountInfo,
      symbol1,
      symbol2,
      lptoken,
      rewardToken,
      pairYields,
      pairsData,
      allPairs = {},
    } = this.props;
    if (loading || !currentPair || !pairsData[currentPair]) return <Loading />;
    const { addLPRate, addLP } = this.state;
    const balance = accountInfo.userBalance[lptoken.tokenID] || 0;
    const currentPairData = pairsData[currentPair] || {};
    const { swapToken1Amount, swapToken2Amount } = currentPairData;
    const bsv_amount = formatSat(swapToken1Amount);

    const { decimal } = allPairs[currentPair]
      ? allPairs[currentPair].token2
      : 8;
    const token_amount = formatSat(swapToken2Amount, decimal);
    const price = formatAmount(token_amount / bsv_amount, decimal);
    const { token2 } = allPairs[currentPair];
    return (
      <div className={styles.content}>
        <Spin spinning={submiting}>
          <div className={styles.data}>{formatAmount(addLPRate, 2)}%</div>
          <Slider value={addLPRate} onChange={this.slideData} />

          <div className={styles.datas}>
            {datas.map((item) => (
              <div
                className={styles.d}
                onClick={() => this.changeData(item.value)}
                key={item.value}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className={styles.balance} onClick={() => this.changeData(100)}>
            {_('balance')}:{' '}
            <span>
              <FormatNumber value={balance} />
            </span>
          </div>

          <div className={styles.pair_box}>
            <div className={styles.pair_left}>
              <div className={styles.icon}>
                <TokenPair
                  symbol1={symbol2}
                  symbol2={symbol1}
                  genesisID2="bsv"
                  genesisID1={token2.tokenID}
                  size={25}
                />
              </div>
              <div className={styles.name}>
                {symbol2}/{symbol1}-LP
              </div>
            </div>
            <div className={styles.pair_right}>
              <Input
                className={styles.input}
                value={addLP}
                onChange={this.changeData}
              />
            </div>
          </div>

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
              <FormatNumber value={pairYields[currentPair]} />% {_('apy')}
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
    const { dispatch, currentPair, lptoken, accountInfo } = this.props;
    const { userAddress, userBalance, changeAddress } = accountInfo;

    let res = await dispatch({
      type: 'farm/reqSwap',
      payload: {
        symbol: currentPair,
        address: userAddress,
        op: 1,
      },
    });

    if (res.code) {
      return message.error(res.msg);
    }

    const { tokenToAddress, requestIndex, bsvToAddress, txFee } = res.data;

    if (
      BigNumber(txFee + 100000)
        .div(Math.pow(10, 8))
        .isGreaterThan(userBalance.BSV || 0)
    ) {
      return message.error(_('lac_token_balance', 'BSV'));
    }

    const _value = BigNumber(addLP)
      .multipliedBy(Math.pow(10, lptoken.decimal))
      .toFixed(0);
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
      symbol: currentPair,
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
      });
    } else {
      return message.error(deposit_res.msg);
    }
  };

  login() {
    EventBus.emit('login');
  }

  renderButton() {
    const { isLogin, accountInfo, lptoken } = this.props;
    const { addLP } = this.state;
    const LP = accountInfo.userBalance[lptoken.tokenID];
    if (!isLogin) {
      // 未登录
      return (
        <Button className={styles.btn_wait} shape="round" onClick={this.login}>
          {_('connect_wallet')}
        </Button>
      );
    } else if (addLP <= 0) {
      // 不存在的交易对
      return (
        <Button className={styles.btn_wait} shape="round">
          {_('enter_amount')}
        </Button>
      );
    } else if (addLP > LP) {
      return (
        <Button className={styles.btn_wait} shape="round">
          {_('lac_balance')}
        </Button>
      );
    } else {
      return (
        <Button
          className={styles.btn}
          type="primary"
          shape="round"
          onClick={this.handleSubmit}
        >
          {_('deposit_earn')}
        </Button>
      );
    }
  }

  renderResult() {
    const { symbol1, symbol2, allPairs, currentPair } = this.props;
    const { token2 } = allPairs[currentPair];
    const { addLP } = this.state;
    return (
      <div className={styles.content}>
        <div className={styles.finish_logo}>
          <CustomIcon
            type="iconicon-success"
            style={{ fontSize: 64, color: '#2BB696' }}
          />
        </div>
        <div className={styles.finish_title}>{_('deposit_success')}</div>
        <div className={styles.small_title}>{_('deposited')}</div>

        <div className={styles.pair_data}>
          <div className={styles.pair_left}>
            <FormatNumber value={addLP} />
          </div>
          <div className={styles.pair_right}>
            <TokenPair
              symbol1={symbol1}
              symbol2={symbol2}
              genesisID2="bsv"
              genesisID1={token2.tokenID}
              size={20}
            />{' '}
            {symbol1}/{symbol2}-LP
          </div>
        </div>

        <Button
          type="primary"
          shape="round"
          className={styles.done_btn}
          onClick={() => {
            this.setState({
              formFinish: false,
              addLP: 0,
              addLPRate: 0,
            });
          }}
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
