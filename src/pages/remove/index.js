'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { gzip } from 'node-gzip';
import { Slider, Button, Spin, message, Input } from 'antd';
import EventBus from 'common/eventBus';
import { formatSat, formatAmount, jc } from 'common/utils';
import Pair from 'components/pair';
import CustomIcon from 'components/icon';
import Loading from 'components/loading';
import TokenPair from 'components/tokenPair';
import TokenLogo from 'components/tokenicon';
import Pool from '../pool';
import styles from './index.less';
import _ from 'i18n';

// import Header from '../layout/header';
import { withRouter } from 'umi';
import BigNumber from 'bignumber.js';

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

@withRouter
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
      symbol1: '',
      symbol2: '',
      removeToken1: 0,
      removeToken2: 0,
      price: 0,
    };
  }

  componentDidMount() {
    this.fetch();
  }

  async fetch() {
    const { dispatch } = this.props;
    const allPairs = await dispatch({
      type: 'pair/getAllPairs',
    });
    // console.log(allPairs);

    let { currentPair } = this.props;
    // console.log(currentPair);

    if (currentPair) {
      const pairData = await dispatch({
        type: 'pair/getPairData',
        payload: {
          currentPair,
        },
      });
      const { swapToken1Amount, swapToken2Amount } = pairData;
      const { token1, token2 } = allPairs[currentPair];
      const symbol1 = token1.symbol.toUpperCase();
      const symbol2 = token2.symbol.toUpperCase();
      const price = BigNumber(formatSat(swapToken2Amount, token2.decimal)).div(
        formatSat(swapToken1Amount, token1.decimal),
      );
      this.setState({
        symbol1,
        symbol2,
        price: formatAmount(price, token2.decimal),
      });
      EventBus.emit('reloadChart', type);
    }
    // console.log(pairData);
  }

  updateData() {
    const { dispatch, currentPair } = this.props;
    dispatch({
      type: 'pair/getPairData',
      payload: {
        currentPair,
      },
    });
    EventBus.emit('reloadChart', type);
    dispatch({
      type: 'user/loadingUserData',
      payload: {},
    });
  }

  renderContent() {
    const {
      currentPair,
      pairData,
      loading,
      userBalance,
      lptoken,
      allPairs,
    } = this.props;
    const LP = userBalance[lptoken.tokenID];
    if (loading || !currentPair) return <Loading />;
    const { symbol1, symbol2 } = this.state;
    return (
      <div className={styles.content}>
        <div className={styles.main_title}>
          <h2>
            <div className={styles.icon}>
              <TokenPair symbol1={symbol1} symbol2={symbol2} size={40} />
            </div>
            <div className={styles.name}>
              {symbol2}/{symbol1}
            </div>
          </h2>
          <div className={styles.subtitle}>{_('your_liq')}</div>
          <div className={styles.fiat}>$</div>
        </div>
        <Pair pairData={pairData} curPair={allPairs[currentPair]} LP={LP} />
      </div>
    );
  }

  changeData = (e) => {
    let value;
    if (e.target) {
      //输入框变化值
      const { userBalance, allPairs, currentPair } = this.props;
      const { lptoken = {} } = allPairs[currentPair];
      const LP = userBalance[lptoken.tokenID] || 0;
      const _removeLp = e.target.value;
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
    const { userBalance, allPairs, currentPair } = this.props;
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
      userBalance,
      loading,
    } = this.props;
    let LP = userBalance[lptoken.tokenID];
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
      userBalance,
      pairData,
      allPairs,
    } = this.props;
    if (loading || !currentPair) return <Loading />;
    const { lptoken = {} } = allPairs[currentPair];
    const { removeRate, removeLP, symbol1, symbol2 } = this.state;
    const LP = userBalance[lptoken.tokenID] || 0;
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
            {_('lp_balance')}: <span>{LP}</span>
          </div>
          <div className={styles.s_box}>
            <div className={styles.coin}>
              <TokenPair symbol1={symbol1} symbol2={symbol2} size={30} />
            </div>
            <div className={styles.name}>
              {symbol1}/{symbol2}-LP
            </div>
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
                <div className={styles.value}>{removeToken1}</div>
              </div>
              <div className={styles.v_item}>
                <div className={styles.value}>{removeToken2}</div>
              </div>
            </div>
            <div className={styles.values_right}>
              <div className={styles.v_item}>
                <div className={styles.label}>
                  <TokenLogo name={symbol1} size={20} />
                  <div style={{ marginLeft: 5 }}>{symbol1}</div>
                </div>
              </div>
              <div className={styles.v_item}>
                <div className={styles.label}>
                  <TokenLogo name={symbol2} size={20} />
                  <div style={{ marginLeft: 5 }}>{symbol2}</div>
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
      userAddress,
      token1,
      token2,
      userBalance,
      lptoken,
      rabinApis,
      changeAddress,
    } = this.props;
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

    if (
      BigNumber(txFee + 100000)
        .div(Math.pow(10, token1.decimal))
        .isGreaterThan(userBalance.BSV || 0)
    ) {
      return message.error(_('lac_token_balance', 'BSV'));
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
            noBroadcast: true,
          },
          {
            type: 'sensibleFt',
            address: tokenToAddress,
            amount: _removeRate,
            changeAddress,
            codehash: lptoken.codeHash,
            genesis: lptoken.tokenID,
            rabinApis,
            noBroadcast: true,
          },
        ],
      },
    });
    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }

    if (tx_res.list) {
      tx_res = tx_res.list;
    }
    if (!tx_res[0] || !tx_res[0].txid || !tx_res[1] || !tx_res[1].txid) {
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

    if (removeliq_res.code && !removeliq_res.data.txid) {
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
    const { isLogin, pairData, userBalance, lptoken } = this.props;
    const LP = userBalance[lptoken.tokenID];
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

  renderInfo() {
    const { symbol1, symbol2, receive_token1, receive_token2 } = this.state;
    return (
      <div className={styles.my_pair_info}>
        <div className={styles.info_title_swap}>
          <div className={styles.info_title}>{_('your_re_liq')}</div>
        </div>
        <div className={styles.info_item}>
          <div className={styles.info_label}>{symbol1}</div>
          <div className={styles.info_value}>{receive_token1}</div>
        </div>
        <div className={styles.info_item}>
          <div className={styles.info_label}>{symbol2}</div>
          <div className={styles.info_value}>{receive_token2}</div>
        </div>
      </div>
    );
  }

  renderResult() {
    // const LP = userBalance[lptoken.tokenID];
    const {
      symbol1,
      symbol2,
      final_lp,
      receive_token1,
      receive_token2,
    } = this.state;
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
              <div className={styles.icon}>
                <TokenPair symbol1={symbol1} symbol2={symbol2} size={20} />
              </div>
              <div className={styles.name}>
                {symbol2}/{symbol1}
              </div>
            </div>
            <div className={styles.f_value}>{final_lp}</div>
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
              <div className={styles.icon}>
                <TokenLogo name={symbol1} size={20} />
              </div>
              <div className={styles.name}>
                {receive_token1} {symbol1}
              </div>
            </div>
            <div className={styles.f_value}>
              <div className={styles.icon}>
                <TokenLogo name={symbol2} size={20} />
              </div>
              <div className={styles.name}>
                {receive_token2} {symbol2}
              </div>
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
    return (
      <Pool>
        <div
          className={styles.container}
          style={{ display: page === 'form' ? 'block' : 'none' }}
        >
          <div className={styles.head}>
            <div className={styles.menu}>
              <span
                className={styles.menu_item}
                key="add_liq"
                onClick={() => {
                  const { currentPair, history } = this.props;
                  history.push(`/pool/${currentPair}/add`);
                }}
              >
                {_('add_liq')}
              </span>
              <span
                className={jc(styles.menu_item, styles.menu_item_selected)}
                key="remove_liq"
              >
                {_('remove_liq_short')}
              </span>
            </div>
          </div>
          {formFinish ? this.renderResult() : this.renderForm()}
        </div>
      </Pool>
    );
  }
}
