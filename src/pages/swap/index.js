'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import debug from 'debug';
import { gzip } from 'node-gzip';
import BigNumber from 'bignumber.js';
import { Button, Form, Input, message, Spin, Modal } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import EventBus from 'common/eventBus';
import { slippage_data, feeRate, FEE_FACTOR, MINAMOUNT } from 'common/config';
import { formatAmount, formatSat, jc } from 'common/utils';
import { TSWAP_CURRENT_PAIR } from 'common/const';
import CustomIcon from 'components/icon';
import TokenLogo from 'components/tokenicon';
import Loading from 'components/loading';
import SelectToken from '../selectToken';
import styles from './index.less';
import _ from 'i18n';

const log = debug('swap');

const { slippage_tolerance_value, defaultSlipValue } = slippage_data;

const FormItem = Form.Item;

@connect(({ user, pair, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...pair,
    loading: effects['pair/getAllPairs'] || effects['pair/getPairData'],
    submiting:
      effects['pair/reqSwap'] ||
      effects['pair/token1toToken2'] ||
      effects['pair/token2toToken1'] ||
      effects['user/transferBsv'] ||
      effects['user/transferAll'] ||
      false,
  };
})
export default class Swap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'form',
      formFinish: false,
      origin_amount: 0,
      aim_amount: 0,
      slip: 0,
      fee: 0,
      txFee: 0,
      lastMod: '',
      dirForward: true, //交易对方向，true正向 false反向
      // bsvToToken: true,
      modalVisible: false,
      tol:
        window.localStorage.getItem(slippage_tolerance_value) ||
        defaultSlipValue,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    EventBus.on('reloadPair', this.fetch);
    this.fetch();
  }

  fetch = async () => {
    const { dispatch } = this.props;
    await dispatch({
      type: 'pair/getAllPairs',
    });

    let { currentPair } = this.props;
    log('currentPair:', currentPair);
    if (currentPair) {
      await dispatch({
        type: 'pair/getPairData',
        payload: {
          currentPair,
        },
      });
    }
  };

  switch = async () => {
    let { dirForward } = this.state;
    this.setState(
      {
        dirForward: !dirForward,
      },
      () => {
        const { current } = this.formRef;
        const { origin_amount, aim_amount } = current.getFieldsValue([
          'origin_amount',
          'aim_amount',
        ]);
        const { lastMod } = this.state;
        const { token1, token2 } = this.props;
        const decimal = !dirForward ? token1.decimal : token2.decimal;
        if (lastMod === 'origin') {
          current.setFieldsValue({
            aim_amount: origin_amount,
          });
          const { newOriginAddAmount } = this.calcAmount(0, origin_amount);
          const fee = formatAmount(
            BigNumber(newOriginAddAmount).multipliedBy(feeRate),
            decimal,
          );
          this.setState({
            lastMod: 'aim',
            aim_amount: origin_amount,
            fee,
          });
        } else if (lastMod === 'aim') {
          current.setFieldsValue({
            origin_amount: aim_amount,
          });
          this.calcAmount(aim_amount, 0);
          const fee = formatAmount(
            BigNumber(aim_amount).multipliedBy(feeRate),
            decimal,
          );
          this.setState({
            lastMod: 'origin',
            origin_amount: aim_amount,
            fee,
          });
        }
      },
    );
  };

  showUI = (name) => {
    this.setState({
      page: name,
    });
  };

  changeOriginAmount = (e) => {
    const value = e.target.value;
    const { token1, token2 } = this.props;
    const { dirForward } = this.state;
    const decimal = dirForward ? token1.decimal : token2.decimal;
    if (value > 0) {
      const fee = formatAmount(BigNumber(value).multipliedBy(feeRate), decimal);
      this.setState({
        origin_amount: value,
        fee,
        lastMod: 'origin',
      });
      // this.calc(value - fee);
      this.calcAmount(value, 0);
    } else {
      this.formRef.current.setFieldsValue({
        aim_amount: 0,
      });
      this.setState({
        fee: 0,
        slip: 0,
        lastMod: '',
        aim_amount: 0,
      });
    }
  };

  changeAimAmount = (e) => {
    const value = e.target.value;
    if (value > 0) {
      this.setState({
        aim_amount: value,
        lastMod: 'aim',
      });
      this.calcAmount(0, value);
    } else {
      this.formRef.current.setFieldsValue({
        origin_amount: 0,
      });
      this.setState({
        fee: 0,
        slip: 0,
        lastMod: '',
        origin_amount: 0,
      });
    }
  };

  renderOriginToken() {
    const { token1, token2, pairData } = this.props;
    const { swapToken1Amount, swapToken2Amount } = pairData;
    const { dirForward } = this.state;
    const origin_token = dirForward ? token1 : token2;
    const symbol1 = origin_token.symbol.toUpperCase();
    return (
      <div className={styles.box}>
        <div className={styles.coin} onClick={() => this.showUI('selectToken')}>
          <TokenLogo name={symbol1} />
          <div className={styles.name}>{symbol1}</div>
          <DownOutlined />
        </div>
        <FormItem name="origin_amount">
          <Input
            className={styles.input}
            onChange={this.changeOriginAmount}
            disabled={swapToken1Amount === '0' || swapToken2Amount === '0'}
          />
        </FormItem>
      </div>
    );
  }

  renderAimToken() {
    const { token1, token2, pairData } = this.props;
    const { swapToken1Amount, swapToken2Amount } = pairData;
    const { dirForward } = this.state;
    const aim_token = dirForward ? token2 : token1;
    const symbol2 = aim_token.symbol.toUpperCase();
    return (
      <div className={styles.box}>
        <div className={styles.coin} onClick={() => this.showUI('selectToken')}>
          <div style={{ width: 40 }}>
            {symbol2 && <TokenLogo name={symbol2} />}
          </div>
          <div className={styles.name}>{symbol2 || _('select')}</div>
          <DownOutlined />
        </div>
        <FormItem name="aim_amount">
          <Input
            className={styles.input}
            onChange={this.changeAimAmount}
            disabled={swapToken1Amount === '0' || swapToken2Amount === '0'}
          />
        </FormItem>
      </div>
    );
  }

  setOriginBalance = () => {
    const { userBalance, token1, token2, pairData } = this.props;
    const { swapToken1Amount, swapToken2Amount } = pairData;
    const { dirForward } = this.state;
    const decimal = dirForward ? token1.decimal : token2.decimal;
    if (swapToken1Amount === '0' || swapToken2Amount === '0') {
      return;
    }

    const origin_amount = this.state.dirForward
      ? userBalance.BSV || 0
      : userBalance[token2.tokenID] || 0;
    this.formRef.current.setFieldsValue({
      origin_amount,
    });
    this.setState({
      origin_amount,
    });
    this.calcAmount(origin_amount, 0);
    if (origin_amount > 0) {
      this.setState({
        // origin_amount,
        lastMod: 'origin',
        fee: formatAmount(
          BigNumber(origin_amount).multipliedBy(feeRate),
          decimal,
        ),
      });
    } else {
      this.setState({
        lastMod: '',
      });
    }
  };
  calcAmount = (originAddAmount = 0, aimAddAmount = 0, pairData) => {
    if (!pairData) pairData = this.props.pairData;
    const { token1, token2 } = this.props;
    const { dirForward } = this.state;
    const { swapToken1Amount, swapToken2Amount, swapFeeRate } = pairData;
    let amount1 = dirForward ? swapToken1Amount : swapToken2Amount;
    let amount2 = dirForward ? swapToken2Amount : swapToken1Amount;
    let decimal1 = dirForward ? token1.decimal : token2.decimal;
    let decimal2 = dirForward ? token2.decimal : token1.decimal;
    let _originAddAmount = BigNumber(originAddAmount).multipliedBy(
      Math.pow(10, decimal1),
    );
    let _aimAddAmount = BigNumber(aimAddAmount).multipliedBy(
      Math.pow(10, decimal2),
    );
    let newAmount1 = BigNumber(amount1),
      newAmount2 = BigNumber(amount2);
    let newOriginAddAmount, newAimAddAmount;
    if (originAddAmount > 0) {
      _originAddAmount = BigInt(_originAddAmount.toString());
      const addAmountWithFee =
        _originAddAmount * BigInt(FEE_FACTOR - swapFeeRate);
      newAmount1 = BigInt(amount1) + _originAddAmount;
      let removeAmount =
        (addAmountWithFee * BigInt(amount2)) /
        ((BigInt(amount1) + _originAddAmount) * BigInt(FEE_FACTOR));
      removeAmount = BigNumber(removeAmount);
      newAmount2 = BigNumber(amount2).minus(removeAmount);

      removeAmount = formatAmount(
        removeAmount.div(Math.pow(10, decimal2)),
        decimal2,
      );

      this.formRef.current.setFieldsValue({
        aim_amount: removeAmount,
      });
      this.setState({
        aim_amount: removeAmount,
      });
      newOriginAddAmount = originAddAmount;
      newAimAddAmount = removeAmount;
    } else if (aimAddAmount > 0) {
      newAmount2 = BigNumber(amount2).minus(_aimAddAmount);
      _aimAddAmount = BigInt(_aimAddAmount.toString());
      let addAmount =
        (_aimAddAmount * BigInt(FEE_FACTOR) * BigInt(amount1)) /
        (BigInt(FEE_FACTOR - swapFeeRate) * BigInt(amount2) -
          _aimAddAmount * BigInt(FEE_FACTOR));

      addAmount = BigNumber(addAmount);
      addAmount = addAmount.div(Math.pow(10, decimal1));
      newAmount1 = addAmount.plus(amount1);
      let addAmountN = formatAmount(addAmount, decimal1);
      if (!addAmount.isGreaterThan(0)) {
        addAmountN = 0;
        newAmount1 = amount1;
        newAmount2 = BigNumber(amount2);
      }

      this.formRef.current.setFieldsValue({
        origin_amount: addAmountN,
      });
      this.setState({
        origin_amount: addAmountN,
        fee:
          addAmount > 0
            ? formatAmount(addAmount.multipliedBy(feeRate), decimal1)
            : 0,
      });
      newOriginAddAmount = addAmountN;
      newAimAddAmount = aimAddAmount;
    } else {
      //两个值都没有大于0
      this.formRef.current.setFieldsValue({
        origin_amount: originAddAmount,
        aim_amount: aimAddAmount,
      });
      this.setState({
        origin_amount: originAddAmount,
        aim_amount: aimAddAmount,
      });
      newOriginAddAmount = originAddAmount;
      newAimAddAmount = aimAddAmount;
    }

    const p = BigNumber(amount2).dividedBy(amount1);
    const p1 = newAmount2.dividedBy(newAmount1);
    const slip = p1.minus(p).dividedBy(p);

    this.setState({
      slip: slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
    });
    return {
      newOriginAddAmount,
      newAimAddAmount,
    };
  };

  renderForm = () => {
    const { token1, token2, pairData, userBalance, submiting } = this.props;
    const { swapToken1Amount, swapToken2Amount } = pairData;
    const { dirForward, tol } = this.state;
    const origin_token = dirForward ? token1 : token2;
    const aim_token = dirForward ? token2 : token1;
    const { slip, fee } = this.state;
    const symbol1 = origin_token.symbol.toUpperCase();
    const symbol2 = aim_token.symbol.toUpperCase();
    const _swapToken1Amount = BigNumber(swapToken1Amount)
      .div(Math.pow(10, token1.decimal))
      .toString();
    const _swapToken2Amount = BigNumber(swapToken2Amount)
      .div(Math.pow(10, token2.decimal))
      .toString();
    const price = dirForward
      ? formatAmount(_swapToken2Amount / _swapToken1Amount, token2.decimal)
      : formatAmount(_swapToken1Amount / _swapToken2Amount, token1.decimal);

    const beyond = parseFloat(slip) > parseFloat(tol);

    return (
      <div className={styles.content}>
        <Spin spinning={submiting}>
          <Form onSubmit={this.handleSubmit} ref={this.formRef}>
            <div className={styles.title}>
              <h3>{_('you_pay')}</h3>
              <div
                className={jc(styles.balance, styles.can_click)}
                onClick={this.setOriginBalance}
              >
                {_('your_balance')}:{' '}
                <span>
                  {userBalance[origin_token.tokenID || 'BSV'] || 0} {symbol1}
                </span>
              </div>
            </div>
            {this.renderOriginToken()}

            <div className={styles.switch_icon}>
              <div className={styles.icon} onClick={this.switch}>
                <CustomIcon type="iconswitch" style={{ fontSize: 20 }} />
              </div>
              <div className={styles.line}></div>
            </div>

            <div className={styles.title}>
              <h3>{_('you_receive')} </h3>
              <div className={styles.balance} style={{ cursor: 'default' }}>
                {_('your_balance')}:{' '}
                <span>
                  {userBalance[aim_token.tokenID || 'BSV'] || 0} {symbol2}
                </span>
              </div>
            </div>

            {this.renderAimToken()}

            <div className={styles.my_pair_info}>
              <div className={styles.key_value}>
                <div className={styles.key}>{_('price')}</div>
                <div className={styles.value}>
                  1 {symbol1} = {price} {symbol2}
                </div>
              </div>
              <div className={styles.key_value}>
                <div className={styles.key}>{_('slippage_tolerance')}</div>
                <div className={styles.value}>
                  <Input
                    value={tol}
                    suffix="%"
                    className={styles.tol}
                    onChange={this.changeTol}
                  />
                </div>
              </div>
              <div className={styles.key_value}>
                <div className={styles.key}>{_('price_impact')}</div>
                <div
                  className={styles.value}
                  style={beyond ? { color: 'red' } : {}}
                >
                  {slip}
                </div>
              </div>
              <div className={styles.key_value}>
                <div className={styles.key}>{_('fee')}</div>
                <div className={styles.value}>
                  {fee} {symbol1}
                </div>
              </div>
            </div>
            {this.renderButton()}
          </Form>
        </Spin>
      </div>
    );
  };

  changeTol = (e) => {
    const value = e.target.value;
    this.setState({
      tol: value,
    });
    localStorage.setItem(slippage_tolerance_value, value);
  };

  login() {
    EventBus.emit('login');
  }

  renderButton() {
    const { isLogin, pairData, token1, token2, userBalance } = this.props;
    const { swapToken1Amount, swapToken2Amount } = pairData;
    const { slip, lastMod, origin_amount, aim_amount, dirForward, tol } =
      this.state;
    const origin_token = dirForward ? token1 : token2;
    const aim_token = dirForward ? token2 : token1;
    const balance = userBalance[origin_token.tokenID || 'BSV'];

    const beyond = parseFloat(slip) > parseFloat(tol);
    if (!isLogin) {
      // 未登录
      return (
        <Button className={styles.btn_wait} onClick={this.login}>
          {_('login')}
        </Button>
      );
    } else if (swapToken1Amount === '0' || swapToken2Amount === '0') {
      // 交易对没有数量，不能交易
      return <Button className={styles.btn_wait}>{_('pair_init')}</Button>;
    } else if (!lastMod || (origin_amount <= 0 && aim_amount <= 0)) {
      // 未输入数量
      return <Button className={styles.btn_wait}>{_('enter_amount')}</Button>;
    } else if (parseFloat(origin_amount) <= formatSat(MINAMOUNT)) {
      // 数额太小
      return (
        <Button className={styles.btn_wait}>
          {_('lower_amount', MINAMOUNT)}
        </Button>
      );
    } else if (parseFloat(origin_amount) > parseFloat(balance || 0)) {
      // 余额不足
      return (
        <Button className={styles.btn_wait}>
          {_('lac_token_balance', origin_token.symbol.toUpperCase())}
        </Button>
      );
    } else if (
      BigNumber(aim_amount)
        .multipliedBy(Math.pow(10, aim_token.decimal))
        .isGreaterThan(
          dirForward ? pairData.swapToken2Amount : pairData.swapToken1Amount,
        )
    ) {
      // 池中币不足
      return (
        <Button className={styles.btn_wait}>
          {_('not_enough', token2.symbol.toUpperCase())}
        </Button>
      );
    } else if (beyond) {
      // 超出容忍度
      return (
        <Button className={styles.btn_warn} onClick={this.preSubmit}>
          {_('swap_anyway')}
        </Button>
      );
    } else {
      return (
        <Button className={styles.btn} type="primary" onClick={this.preSubmit}>
          {_('swap')}
        </Button>
      );
    }
  }

  preSubmit = async () => {
    const { dirForward, origin_amount, aim_amount, lastMod } = this.state;
    const { dispatch, currentPair, userAddress, token2 } = this.props;
    const res = await dispatch({
      type: 'pair/reqSwap',
      payload: {
        symbol: currentPair,
        address: userAddress,
        op: dirForward ? 3 : 4,
      },
    });
    const { code, data, msg } = res;
    if (code) {
      return message.error(msg);
    }

    this.setState({
      reqSwapData: data,
    });
    let old_aim_amount = aim_amount;
    let old_origin_amount = origin_amount;
    if (lastMod === 'origin') {
      const { newAimAddAmount } = this.calcAmount(origin_amount, 0, data);
      const slip = BigNumber(newAimAddAmount)
        .minus(old_aim_amount)
        .div(old_aim_amount);

      if (newAimAddAmount !== old_aim_amount) {
        return this.showModal(
          origin_amount,
          newAimAddAmount,
          slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
        );
      }
    } else if (lastMod === 'aim') {
      const { newOriginAddAmount } = this.calcAmount(0, aim_amount, data);
      const slip = BigNumber(newOriginAddAmount)
        .minus(origin_amount)
        .div(origin_amount);

      if (newOriginAddAmount !== old_origin_amount) {
        return this.showModal(
          newOriginAddAmount,
          aim_amount,
          slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
        );
      }
    }
    this.submit(data);
  };

  submit = async (data) => {
    const { dirForward, origin_amount, reqSwapData } = this.state;
    const {
      dispatch,
      currentPair,
      token2,
      rabinApis,
      userBalance,
      changeAddress,
    } = this.props;

    const { bsvToAddress, tokenToAddress, txFee, requestIndex } =
      reqSwapData || data;
    let payload = {
      symbol: currentPair,
      requestIndex: requestIndex,
      op: dirForward ? 3 : 4,
    };
    if (dirForward) {
      let amount = BigNumber(origin_amount).multipliedBy(1e8).toString();
      const userTotal = BigNumber(userBalance.BSV).multipliedBy(1e8);
      let total = BigInt(amount) + BigInt(txFee);
      const _allBalance = total > BigInt(userTotal);
      if (_allBalance) {
        total = userTotal;
        amount = BigInt(userTotal) - BigInt(txFee);
      }
      if (amount < MINAMOUNT) {
        return message.error(_('lower_amount', MINAMOUNT));
      }
      const ts_res = await dispatch({
        type: 'user/transferBsv',
        payload: {
          address: bsvToAddress,
          amount: total.toString(),
          changeAddress,
          noBroadcast: true,
        },
      });
      if (ts_res.msg) {
        return message.error(ts_res.msg);
      }
      if (_allBalance) {
        amount = amount - BigInt(ts_res.fee || 0);
      }

      payload = {
        ...payload,
        // token1TxID: ts_res.txid,
        bsvOutputIndex: 0,
        bsvRawTx: ts_res.txHex,
        token1AddAmount: amount.toString(),
      };
    } else {
      const amount = BigNumber(origin_amount)
        .multipliedBy(Math.pow(10, token2.decimal))
        .toString();

      const tx_res = await dispatch({
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
              amount,
              changeAddress,
              codehash: token2.codeHash,
              genesis: token2.tokenID,
              rabinApis,
              noBroadcast: true,
            },
          ],
        },
      });
      // console.log(tx_res)
      if (!tx_res) {
        return message.error(_('txs_fail'));
      }
      if (tx_res.msg) {
        return message.error(tx_res.msg);
      }
      if (!tx_res[0] || !tx_res[0].txid || !tx_res[1] || !tx_res[1].txid) {
        return message.error(_('txs_fail'));
      }
      // console.log(tx_res); debugger;
      payload = {
        ...payload,
        bsvRawTx: tx_res[0].txHex,
        bsvOutputIndex: 0,
        token2RawTx: tx_res[1].txHex,
        token2OutputIndex: 0,
        amountCheckRawTx: tx_res[1].routeCheckTxHex,
      };
    }

    let swap_data = JSON.stringify(payload);
    swap_data = await gzip(swap_data);

    const swap_res = await dispatch({
      type: dirForward ? 'pair/token1toToken2' : 'pair/token2toToken1',
      payload: {
        data: swap_data,
      },
    });
    // console.log(swap_res);
    if (swap_res.code && !swap_res.data) {
      return message.error(swap_res.msg);
    }
    message.success('success');
    this.updateData();
    this.setState({
      formFinish: true,
      txid: swap_res.data.txid,
      txFee: txFee,
    });
  };

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

  renderResult() {
    const { origin_amount, aim_amount, txFee, dirForward, txid } = this.state;
    const { token1, token2 } = this.props;
    const origin_token = dirForward ? token1 : token2;
    const aim_token = dirForward ? token2 : token1;
    const symbol1 = origin_token.symbol.toUpperCase();
    const symbol2 = aim_token.symbol.toUpperCase();

    return (
      <div className={styles.content}>
        <div className={styles.finish_logo}>
          <CustomIcon
            type="iconicon-success"
            style={{ fontSize: 64, color: '#2BB696' }}
          />
        </div>
        <div className={styles.finish_title}>{_('swap_success')}</div>

        <div className={styles.detail}>
          <div className={styles.line}>
            <div className={styles.detail_item}>
              <div className={styles.item_label}>{_('paid')}</div>
              <div className={styles.item_value}>
                {origin_amount} {symbol1}
              </div>
            </div>
            <div className={styles.detail_item} style={{ textAlign: 'right' }}>
              <div className={styles.item_label}>{_('received')}</div>
              <div className={styles.item_value}>
                {aim_amount} {symbol2}
              </div>
            </div>
          </div>
          <div className={styles.detail_item}>
            <div className={styles.item_label}>{_('swap_fee')}</div>
            <div className={styles.item_value}>{formatSat(txFee)} BSV</div>
          </div>
          <div className={styles.detail_item}>
            <div className={styles.item_label}>{_('onchain_tx')}</div>
            <div className={styles.item_value}>{txid}</div>
          </div>
        </div>
        <Button className={styles.done_btn} onClick={this.finish}>
          {_('done')}
        </Button>
      </div>
    );
  }
  finish = () => {
    this.setState({
      formFinish: false,
      origin_amount: 0,
      aim_amount: 0,
      lastMod: '',
      fee: 0,
      slip: 0,
    });
  };

  renderSwap() {
    const { formFinish } = this.state;

    return (
      <div className={styles.container}>
        {formFinish ? this.renderResult() : this.renderForm()}
      </div>
    );
  }

  selectedToken = (currentPair) => {
    if (currentPair && currentPair !== this.props.currentPair) {
      // if (this.state.page === 'selectToken') {
      window.localStorage.setItem(TSWAP_CURRENT_PAIR, currentPair);
      this.props.dispatch({
        type: 'pair/getPairData',
        payload: {
          currentPair,
        },
      });
      // }
      this.setState({
        origin_amount: 0,
        aim_amount: 0,
      });
    }
    this.showUI('form');
  };
  showModal = (origin, aim, slip) => {
    const { dirForward } = this.state;
    const { token1, token2 } = this.props;
    const origin_token = dirForward ? token1 : token2;
    const aim_token = dirForward ? token2 : token1;
    Modal.confirm({
      title: _('swap_price_change_title'),
      onOk: this.handleOk,
      icon: '',
      content: _('swap_price_change_content')
        .replace('%1', `${origin} ${origin_token.symbol.toUpperCase()}`)
        .replace('%2', `${aim} ${aim_token.symbol.toUpperCase()}`)
        .replace('%3', slip),
      okText: _('swap'),
      cancelText: _('cancel'),
      wrapClassName: 'confirm_dialog',
      width: 400,
    });
  };
  handleOk = () => {
    this.setState({
      modalVisible: false,
    });
    this.submit();
  };

  render() {
    const { currentPair, loading } = this.props;
    if (loading) return <Loading />;
    if (!currentPair) return 'No pair';
    const { page } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        {this.renderSwap()}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: page === 'selectToken' ? 'block' : 'none',
          }}
        >
          <div className={styles.selectToken_wrap}>
            <SelectToken close={(id) => this.selectedToken(id, page)} />
          </div>
        </div>
      </div>
    );
  }
}
