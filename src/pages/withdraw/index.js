'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { Slider, Button, Spin, message, Input } from 'antd';
import EventBus from 'common/eventBus';
import { formatAmount } from 'common/utils';
import CustomIcon from 'components/icon';
import Loading from 'components/loading';
import TokenLogo from 'components/tokenicon';
import styles from '../deposit/index.less';
import _ from 'i18n';

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
@connect(({ user, farm, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...farm,
    loading: effects['farm/getAllPairs'],
    submiting:
      effects['farm/reqSwap'] ||
      effects['farm/withdraw'] ||
      effects['user/transferAll'] ||
      false,
  };
})
export default class Withdraw extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addLPRate: 0,
      addLP: 0,
      formFinish: false,
      price: 0,
    };
  }

  updateData() {
    const { dispatch, userAddress } = this.props;
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
      const { userBalance, allPairs, currentPair } = this.props;
      const { lptoken = {} } = allPairs[currentPair];
      const LP = userBalance[lptoken.tokenID] || 0;
      const _addLp = e.target.value;
      if (_addLp <= 0) {
        value = 0;
      } else if (_addLp >= lockedTokenAmount) {
        value = 100;
      } else {
        value = BigNumber(_addLp)
          .div(lockedTokenAmount)
          .multipliedBy(100)
          .toString();
      }
      return this.setState({
        addLP: _addLp,
        addLPRate: value,
      });
    }
    this.slideData(e);
  };

  slideData = (value) => {
    const { lockedTokenAmount } = this.props;
    this.setState({
      addLPRate: value,
      addLP: BigNumber(lockedTokenAmount)
        .multipliedBy(value)
        .div(100)
        .toString(),
    });
  };

  renderForm() {
    const {
      currentPair,
      loading,
      submiting,
      symbol1,
      symbol2,
      lptoken,
      lockedTokenAmount,
    } = this.props;
    if (loading || !currentPair) return <Loading />;
    const { addLPRate, addLP } = this.state;
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
            {_('balance')}: <span>{lockedTokenAmount}</span>
          </div>

          <div className={styles.pair_box}>
            <div className={styles.pair_left}>
              <div className={styles.icon}>
                <TokenLogo name={symbol2} size={25} />
                <TokenLogo
                  name={symbol1}
                  size={25}
                  style={{ marginLeft: '-10px' }}
                />
              </div>
              <div className={styles.name}>
                {symbol2}/{symbol1}-LP
              </div>
            </div>
            <div className={styles.pair_right}>
              <Input
                style={{ width: 130 }}
                className={styles.input}
                value={addLP}
                onChange={this.changeData}
              />
            </div>
          </div>

          {this.renderButton()}
        </Spin>
      </div>
    );
  }

  handleSubmit = async () => {
    const { addLP } = this.state;
    const { dispatch, currentPair, userAddress, userBalance, lptoken } =
      this.props;

    let res = await dispatch({
      type: 'farm/reqSwap',
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
        .div(Math.pow(10, 8))
        .isGreaterThan(userBalance.BSV || 0)
    ) {
      return message.error(_('lac_token_balance', 'BSV'));
    }

    const _value = BigNumber(addLP)
      .multipliedBy(Math.pow(10, lptoken.decimal))
      .toFixed(0);
    const tx_res = await dispatch({
      type: 'user/transferBsv',
      payload: {
        address: bsvToAddress,
        amount: txFee,
      },
    });
    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }

    if (!tx_res.txid) {
      return message.error(_('txs_fail'));
    }

    const withdraw_res = await dispatch({
      type: 'farm/withdraw',
      payload: {
        symbol: currentPair,
        requestIndex: requestIndex,
        tokenRemoveAmount: _value,
      },
    });
    if (withdraw_res.code) {
      return message.error(withdraw_res.msg);
    }
    message.success('success');
    this.updateData();
    this.setState({
      formFinish: true,
    });
  };

  login() {
    EventBus.emit('login');
  }

  renderButton() {
    const { isLogin, lockedTokenAmount } = this.props;
    const { addLP } = this.state;
    if (!isLogin) {
      // 未登录
      return (
        <Button className={styles.btn_wait} onClick={this.login}>
          {_('login')}
        </Button>
      );
    } else if (addLP <= 0) {
      // 不存在的交易对
      return <Button className={styles.btn_wait}>{_('enter_amount')}</Button>;
    } else if (addLP > lockedTokenAmount) {
      return <Button className={styles.btn_wait}>{_('lac_balance')}</Button>;
    } else {
      return (
        <Button
          className={styles.btn}
          type="primary"
          onClick={this.handleSubmit}
        >
          {_('withdraw')}
        </Button>
      );
    }
  }

  renderResult() {
    const { symbol1, symbol2 } = this.props;
    const { addLP } = this.state;
    return (
      <div className={styles.content}>
        <div className={styles.finish_logo}>
          <CustomIcon
            type="iconicon-success"
            style={{ fontSize: 64, color: '#2BB696' }}
          />
        </div>
        <div className={styles.finish_title}>{_('withdraw_success')}</div>
        <div className={styles.small_title}>{_('Withdrew')}</div>

        <div className={styles.pair_data}>
          <div className={styles.pair_left}>{addLP}</div>
          <div className={styles.pair_right}>
            <div className={styles.icon} style={{ marginRight: 10 }}>
              <CustomIcon type="iconlogo-bitcoin" />
              <CustomIcon type="iconlogo-vusd" />
            </div>{' '}
            {symbol1}/{symbol2}-LP
          </div>
        </div>

        <Button
          type="primary"
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
