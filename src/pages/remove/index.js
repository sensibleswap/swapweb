'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { gzip } from 'node-gzip';
import BigNumber from 'bignumber.js';
import { Slider, Button, Spin, message, Input } from 'antd';
import EventBus from 'common/eventBus';
import { formatSat, formatAmount, LeastFee } from 'common/utils';
import CustomIcon from 'components/icon';
import FormatNumber from 'components/formatNumber';
import Loading from 'components/loading';
import PoolMenu from 'components/poolMenu';
import PairIcon from 'components/pairIcon';
import Pool from '../pool';
import styles from './index.less';
import _ from 'i18n';

let busy = false;
const type = 'pool';

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

@connect(({ user, pair, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...pair,
    loading: effects['pair/getAllPairs'] || effects['pair/getPairData'],
    spinning: effects['pair/getPairData'] || effects['user/loadingUserData'],
    submiting:
      effects['pair/reqSwap'] ||
      effects['pair/removeLiq'] ||
      effects['user/transferAll'] ||
      false,
  };
})
export default class RemovePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      removeRate: 0,
      removeLp: 0,
      page: 'form',
      formFinish: false,
      removeToken1: 0,
      removeToken2: 0,
      price: 0,
    };
  }

  componentDidMount() {
    EventBus.on('reloadPair', () => {
      const { hash } = window.location;
      if (hash.indexOf('remove') > -1) {
        this.fetch();
        this.setState({ page: 'form' });
      }
    });
    this.fetch();
  }

  async fetch() {
    if (busy) return;
    busy = true;
    const { dispatch } = this.props;
    await dispatch({
      type: 'pair/getAllPairs',
    });

    // if (currentPair) {
    const pairData = await dispatch({
      type: 'pair/getPairData',
      payload: {
        // currentPair,
      },
    });

    // }

    const { currentPair, allPairs } = this.props;
    const { swapToken1Amount, swapToken2Amount } = pairData;
    const { token1, token2 } = allPairs[currentPair];
    const price = BigNumber(formatSat(swapToken2Amount, token2.decimal)).div(
      formatSat(swapToken1Amount, token1.decimal),
    );
    this.setState({
      price: formatAmount(price, token2.decimal),
    });
    EventBus.emit('reloadChart', type);
    busy = false;
    // }
    // console.log(pairData);
  }

  updateData() {
    const { dispatch, currentPair } = this.props;
    dispatch({
      type: 'pair/getPairData',
      payload: {
        // currentPair,
      },
    });
    EventBus.emit('reloadChart', type);
    dispatch({
      type: 'user/loadingUserData',
      payload: {},
    });
  }

  changeData = (e) => {
    let value;
    if (e.target) {
      //输入框变化值
      const { accountInfo, allPairs, currentPair } = this.props;
      const { lptoken = {} } = allPairs[currentPair];
      const LP = accountInfo.userBalance[lptoken.tokenID] || 0;
      let _removeLp = e.target.value;
      _removeLp = formatAmount(_removeLp, lptoken.decimal);
      if (_removeLp <= 0) {
        value = 0;
      } else if (_removeLp >= LP) {
        value = 100;
      } else {
        value = BigNumber(_removeLp).div(LP).multipliedBy(100).toString();
      }
      return this.setState({
        removeLP: _removeLp,
        removeRate: value,
      });
    }
    this.slideData(e);
  };

  slideData = (value) => {
    const { accountInfo, allPairs, currentPair } = this.props;
    const { userBalance } = accountInfo;
    const { lptoken = {} } = allPairs[currentPair];
    const LP = userBalance[lptoken.tokenID] || 0;
    this.setState({
      removeRate: value,
      removeLP: BigNumber(LP).multipliedBy(value).div(100).toString(),
    });
  };
  calc = () => {
    const {
      currentPair,
      pairData,
      lptoken = {},
      allPairs,
      accountInfo,
      loading,
    } = this.props;
    let LP = accountInfo.userBalance[lptoken.tokenID];
    if (loading || !LP) {
      return {
        removeToken1: 0,
        removeToken2: 0,
        removeLP: 0,
      };
    }

    // if (!LP) {
    //   const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;
    //   const { removeLP = 0 } = this.state;
    //   console.log(removeLP);
    //   const rate = BigNumber(removeLP).div(swapLpAmount);
    //   const { token1, token2 } = allPairs[currentPair];
    //   const removeToken1 = formatSat(
    //     BigNumber(swapToken1Amount).multipliedBy(rate),
    //     token1.decimal,
    //   );
    //   const removeToken2 = formatSat(
    //     BigNumber(swapToken2Amount).multipliedBy(rate),
    //     token2.decimal,
    //   );
    //   return {
    //     removeToken1: formatAmount(removeToken1, token1.decimal),
    //     removeToken2: formatAmount(removeToken2, token2.decimal),
    //     removeLP: formatSat(removeLP, lptoken.decimal),
    //   };
    // }
    LP = BigNumber(LP).multipliedBy(Math.pow(10, lptoken.decimal));
    const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;
    const { removeRate } = this.state;
    const removeLP = LP.multipliedBy(removeRate).div(100);
    const rate = removeLP.div(swapLpAmount);
    const { token1, token2 } = allPairs[currentPair];
    const removeToken1 = formatSat(
      BigNumber(swapToken1Amount).multipliedBy(rate),
      token1.decimal,
    );
    const removeToken2 = formatSat(
      BigNumber(swapToken2Amount).multipliedBy(rate),
      token2.decimal,
    );
    return {
      removeToken1: formatAmount(removeToken1, token1.decimal),
      removeToken2: formatAmount(removeToken2, token2.decimal),
      removeLP: formatSat(removeLP, lptoken.decimal),
    };
  };

  renderForm() {
    const {
      currentPair,
      loading,
      submiting,
      accountInfo,
      // pairData,
      allPairs,
    } = this.props;
    if (loading || !currentPair) return <Loading />;
    const { lptoken = {} } = allPairs[currentPair];
    const { removeRate, removeLP } = this.state;
    const LP = accountInfo.userBalance[lptoken.tokenID] || 0;
    const { removeToken1, removeToken2 } = this.calc();
    return (
      <div className={styles.remove_content}>
        <Spin spinning={submiting}>
          <div className={styles.data}>{formatAmount(removeRate, 2)}%</div>
          <Slider value={removeRate} onChange={this.slideData} />

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

          <div
            className={styles.lp_balance}
            onClick={() => this.changeData(100)}
          >
            {_('lp_balance')}:{' '}
            <span>
              <FormatNumber value={LP} />
            </span>
          </div>
          <div className={styles.s_box}>
            <PairIcon keyword="pair" txt="name1/name2-LP" />
            <Input
              className={styles.input}
              value={removeLP}
              onChange={this.changeData}
              // formatter={(value) => parseFloat(value || 0)}
            />
          </div>

          <div className={styles.switch_icon}>
            <div className={styles.icon} onClick={this.switch}>
              <CustomIcon type="iconArrow2" style={{ fontSize: 14 }} />
            </div>
            <div className={styles.line}></div>
          </div>

          <div className={styles.values}>
            <div className={styles.values_left}>
              <div className={styles.v_item}>
                <div className={styles.label}>
                  <PairIcon keyword="token1" size={20} />
                </div>
              </div>
              <div className={styles.v_item}>
                <div className={styles.label}>
                  <PairIcon keyword="token2" size={20} />
                </div>
              </div>
            </div>
            <div className={styles.values_right}>
              <div className={styles.v_item}>
                <div className={styles.value}>
                  <FormatNumber value={removeToken1} />
                </div>
              </div>
              <div className={styles.v_item}>
                <div className={styles.value}>
                  <FormatNumber value={removeToken2} />
                </div>
              </div>
            </div>
          </div>

          {this.renderButton()}
        </Spin>
      </div>
    );
  }

  handleSubmit = async () => {
    const { removeRate } = this.state;
    const {
      dispatch,
      currentPair,
      token1,
      token2,
      lptoken,
      rabinApis,
      accountInfo,
    } = this.props;
    const { userBalance, userAddress, changeAddress } = accountInfo;
    const LP = userBalance[lptoken.tokenID];

    let res = await dispatch({
      type: 'pair/reqSwap',
      payload: {
        symbol: currentPair,
        address: userAddress,
        op: 2,
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

    const removeLP = BigNumber(removeRate).multipliedBy(LP).div(100);
    const _removeRate = removeLP
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
            note: 'tswap.io(remove liquidity)',
          },
          {
            type: 'sensibleFt',
            address: tokenToAddress,
            amount: _removeRate,
            changeAddress,
            codehash: lptoken.codeHash,
            genesis: lptoken.tokenID,
            rabinApis,
            note: 'tswap.io(remove liquidity)',
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

    let liq_data = {
      symbol: currentPair,
      requestIndex: requestIndex,
      bsvRawTx: tx_res[0].txHex,
      bsvOutputIndex: 0,
      lpTokenRawTx: tx_res[1].txHex,
      lpTokenOutputIndex: 0,
      amountCheckRawTx: tx_res[1].routeCheckTxHex,
    };
    liq_data = JSON.stringify(liq_data);
    liq_data = await gzip(liq_data);
    const removeliq_res = await dispatch({
      type: 'pair/removeLiq',
      payload: {
        data: liq_data,
      },
    });

    if (removeliq_res.code && removeliq_res.msg) {
      return message.error(removeliq_res.msg);
    }
    message.success('success');
    this.updateData();
    this.setState({
      formFinish: true,
      final_lp: removeLP.toString(),
      receive_token1: formatSat(
        removeliq_res.data.token1Amount,
        token1.decimal,
      ),
      receive_token2: formatSat(
        removeliq_res.data.token2Amount,
        token2.decimal,
      ),
    });
  };

  login() {
    EventBus.emit('login');
  }

  renderButton() {
    const { isLogin, pairData, accountInfo, lptoken } = this.props;
    const LP = accountInfo.userBalance[lptoken.tokenID];
    if (!isLogin) {
      // 未登录
      return (
        <Button className={styles.btn_wait} shape="round" onClick={this.login}>
          {_('connect_wallet')}
        </Button>
      );
    } else if (!pairData) {
      // 不存在的交易对
      return (
        <Button className={styles.btn_wait} shape="round">
          {_('no_pair')}
        </Button>
      );
    } else if (!LP || LP === '0') {
      return (
        <Button className={styles.btn_wait} shape="round">
          {_('cant_remove')}
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
          {_('remove')}
        </Button>
      );
    }
  }

  renderResult() {
    // const LP = userBalance[lptoken.tokenID];
    const { final_lp, receive_token1, receive_token2 } = this.state;
    return (
      <div className={styles.remove_content}>
        <div className={styles.finish_logo}>
          <CustomIcon
            type="iconicon-success"
            style={{ fontSize: 80, color: '#2BB696' }}
          />
        </div>
        <div className={styles.finish_title}>{_('liq_removed')}</div>

        <div className={styles.f_box}>
          <div className={styles.f_title}>{_('your_pos')}</div>
          <div className={styles.f_item}>
            <div className={styles.f_label}>
              <PairIcon keyword="pair" size={20} />
            </div>
            <div className={styles.f_value}>
              <FormatNumber value={final_lp} />
            </div>
          </div>
        </div>

        <div className={styles.switch_icon} style={{ margin: '6px 0' }}>
          <div className={styles.icon} onClick={this.switch}>
            <CustomIcon type="iconArrow2" style={{ fontSize: 12 }} />
          </div>
        </div>

        <div className={styles.f_box}>
          <div className={styles.f_title}>{_('your_re_liq')}</div>
          <div className={styles.f_item}>
            <div className={styles.f_label}>
              <PairIcon keyword="token1" size={20}>
                <FormatNumber value={receive_token1} />
              </PairIcon>
            </div>
            <div className={styles.f_value}>
              <PairIcon keyword="token2" size={20}>
                <FormatNumber value={receive_token2} />
              </PairIcon>
            </div>
          </div>
        </div>
        <Button
          type="primary"
          shape="round"
          className={styles.done_btn}
          onClick={() => {
            this.setState({
              formFinish: false,
              removeRate: 0,
              removeLP: 0,
            });
          }}
        >
          {_('done')}
        </Button>
      </div>
    );
  }

  render() {
    const { page, formFinish } = this.state;
    const { currentPair } = this.props;
    return (
      <Pool>
        <div
          className={styles.container}
          style={{ display: page === 'form' ? 'block' : 'none' }}
        >
          <PoolMenu currentMenuIndex={1} currentPair={currentPair} />
          {formFinish ? this.renderResult() : this.renderForm()}
        </div>
      </Pool>
    );
  }
}
