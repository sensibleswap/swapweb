'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { Slider, Button, Spin, message, Input } from 'antd';
import EventBus from 'common/eventBus';
import { formatSat, formatAmount, jc } from 'common/utils';
import Pair from 'components/pair';
import CustomIcon from 'components/icon';
import Loading from 'components/loading';
import TokenLogo from 'components/tokenicon';
import Pool from '../pool';
import styles from './index.less';
import _ from 'i18n';

// import Header from '../layout/header';
import { withRouter } from 'umi';
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
      value: 0,
      page: 'form',
      formFinish: true,
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
    dispatch({
      type: 'user/loadingUserData',
      payload: {},
    });
  }

  renderContent() {
    const { currentPair, pairData, loading, userBalance, lptoken, allPairs } =
      this.props;
    const LP = userBalance[lptoken.tokenID];
    if (loading || !currentPair) return <Loading />;
    const { symbol1, symbol2 } = this.state;
    return (
      <div className={styles.content}>
        <div className={styles.main_title}>
          <h2>
            <div className={styles.icon}>
              <TokenLogo name={symbol1} size={40} />
              <TokenLogo name={symbol2} size={40} />
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

  changeData = (value) => {
    this.setState({ value });
  };

  slideData = (value) => {
    this.setState({ value });
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
    LP = BigNumber(LP).multipliedBy(Math.pow(10, lptoken.decimal));
    const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;
    const { value } = this.state;
    const removeLP = LP.multipliedBy(value).div(100);
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
    const { currentPair, loading, submiting } = this.props;
    if (loading || !currentPair) return <Loading />;
    const { value, price, symbol1, symbol2 } = this.state;
    const { removeToken1, removeToken2, removeLP } = this.calc();
    return (
      <div className={styles.content}>
        <Spin spinning={submiting}>
          <div className={styles.data}>{value}%</div>
          <Slider value={value} onChange={this.slideData} />

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
          <div className={styles.balance}>
            {_('balance')}: <span>0.123456</span>
          </div>

          <div className={styles.pair_box}>
            <div className={styles.pair_left}>
              <div className={styles.icon}>
                <TokenLogo name={symbol1} size={25} />
                <TokenLogo name={symbol2} size={25} />
              </div>
              <div className={styles.name}>
                {symbol2}/{symbol1}
              </div>
            </div>
            <div className={styles.pair_right}>
              <Input style={{ width: 130 }} className={styles.input} />
            </div>
          </div>

          <div className={styles.switch_icon}>
            <div className={styles.icon} onClick={this.switch}>
              <CustomIcon type="iconArrow2" style={{ fontSize: 20 }} />
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
                <TokenLogo name="tsc" size={25} />
              </div>
              <div className={styles.name} style={{ fontSize: 22 }}>
                TSC
              </div>
            </div>
            <div className={styles.pair_right}>
              3,000 % APY
              <CustomIcon
                type="iconi"
                style={{
                  backgroundColor: '#DBDBDB',
                  borderRadius: '50%',
                  fontSize: 15,
                  padding: 2,
                  width: 15,
                  textAlign: 'center',
                  marginLeft: 5,
                }}
              />
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
    const { value } = this.state;
    const {
      dispatch,
      currentPair,
      userAddress,
      token1,
      userBalance,
      lptoken,
      rabinApis,
    } = this.props;
    const { removeToken1, removeToken2 } = this.calc();
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

    const removeLP = BigNumber(value).multipliedBy(LP).div(100);
    const _value = removeLP
      .multipliedBy(Math.pow(10, lptoken.decimal))
      .toFixed(0);
    const tx_res = await dispatch({
      type: 'user/transferAll',
      payload: {
        datas: [
          {
            type: 'bsv',
            address: bsvToAddress,
            amount: txFee,
          },
          {
            type: 'sensibleFt',
            address: tokenToAddress,
            amount: _value,
            codehash: lptoken.codeHash,
            genesis: lptoken.tokenID,
            rabinApis,
          },
        ],
      },
    });
    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }

    if (!tx_res[0] || !tx_res[0].txid || !tx_res[1] || !tx_res[1].txid) {
      return message.error(_('txs_fail'));
    }

    const removeliq_res = await dispatch({
      type: 'pair/removeLiq',
      payload: {
        symbol: currentPair,
        requestIndex: requestIndex,
        minerFeeTxID: tx_res[0].txid,
        minerFeeTxOutputIndex: 0,
        lpTokenTxID: tx_res[1].txid,
        lpTokenOutputIndex: 0,
      },
    });

    if (removeliq_res.code) {
      return message.error(removeliq_res.msg);
    }
    message.success('success');
    this.updateData();
    this.setState({
      formFinish: true,
      final_lp: removeLP.toString(),
      receive_token1: removeToken1,
      receive_token2: removeToken2,
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
        <Button className={styles.btn_wait} onClick={this.login}>
          {_('login')}
        </Button>
      );
    } else if (!pairData) {
      // 不存在的交易对
      return <Button className={styles.btn_wait}>{_('no_pair')}</Button>;
    } else if (!LP || LP === '0') {
      return <Button className={styles.btn_wait}>{_('cant_remove')}</Button>;
    } else {
      return (
        <Button
          className={styles.btn}
          type="primary"
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
    const { spinning } = this.props;
    // const LP = userBalance[lptoken.tokenID];
    const { symbol1, symbol2, final_lp } = this.state;
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
          <div className={styles.pair_left}>8,000.00</div>
          <div className={styles.pair_right}>
            <div className={styles.icon} style={{ marginRight: 10 }}>
              <CustomIcon type="iconlogo-bitcoin" />
              <CustomIcon type="iconlogo-vusd" />
            </div>{' '}
            BSV-USDT LP
          </div>
        </div>

        <Button
          type="primary"
          className={styles.done_btn}
          onClick={() => {
            this.setState({
              formFinish: false,
              value: 0,
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