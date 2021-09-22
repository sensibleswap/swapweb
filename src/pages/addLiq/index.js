'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import BigNumber from 'bignumber.js';
import { gzip } from 'node-gzip';
import { Button, Form, Input, Spin, message, Modal } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import EventBus from 'common/eventBus';
import { formatAmount, formatSat, jc } from 'common/utils';
import { countLpAddAmount, countLpAddAmountWithToken2 } from 'common/swap';
import CustomIcon from 'components/icon';
import TokenPair from 'components/tokenPair';
import TokenLogo from 'components/tokenicon';
import Loading from 'components/loading';
import SelectToken from '../selectToken';
import Pool from '../pool';
import styles from './index.less';
import _ from 'i18n';

const type = 'pool';
// let _poolTimer = 0;
const FormItem = Form.Item;
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
      effects['pair/addLiq'] ||
      effects['user/transferBsv'] ||
      // effects['user/transferFtTres'] ||
      effects['user/transferAll'] ||
      false,
  };
})
export default class Liquidity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 'form',
      lastMod: '',
      formFinish: false,
      showDetail: false,
      origin_amount: 0,
      aim_amount: 0,
      lp: 0,
      price_dir: true,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    EventBus.on('reloadPair', () => {
      this.fetch();
    });
    this.fetch();
  }

  fetch = async () => {
    const { dispatch } = this.props;
    await dispatch({
      type: 'pair/getAllPairs',
    });

    let { currentPair } = this.props;
    if (currentPair) {
      await dispatch({
        type: 'pair/getPairData',
        payload: {
          currentPair,
        },
      });
    }
    EventBus.emit('reloadChart', type);
  };

  changeOriginAmount = (e) => {
    const value = e.target.value;
    const { pairData, token1, token2 } = this.props;
    const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;

    if (swapToken1Amount === '0' && swapToken2Amount === '0') {
      //第一次添加流动性
      this.setState({
        origin_amount: value || 0,
        lastMod: 'origin',
      });
      return;
    }

    const origin_amount = BigNumber(value || 0)
      .multipliedBy(Math.pow(10, token1.decimal))
      .toString();
    const [lpMinted, token2AddAmount] = countLpAddAmount(
      origin_amount,
      swapToken1Amount,
      swapToken2Amount,
      swapLpAmount,
    );
    // console.log(lpMinted, token2AddAmount);

    const user_aim_amount = formatSat(token2AddAmount, token2.decimal);
    this.formRef.current.setFieldsValue({
      aim_amount: user_aim_amount,
    });
    this.setState({
      origin_amount: value || 0,
      aim_amount: user_aim_amount,
      lp: lpMinted,
      lastMod: 'origin',
    });
  };

  changeAimAmount = (e) => {
    const value = e.target.value;
    const { pairData, token2, token1 } = this.props;
    const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;

    if (swapToken1Amount === '0' && swapToken2Amount === '0') {
      //第一次添加流动性
      this.setState({
        aim_amount: value || 0,
        lastMod: 'aim',
      });
      return;
    }
    const aim_amount = BigNumber(value || 0)
      .multipliedBy(Math.pow(10, token2.decimal))
      .toString();
    const [lpMinted, token1AddAmount] = countLpAddAmountWithToken2(
      aim_amount,
      swapToken1Amount,
      swapToken2Amount,
      swapLpAmount,
    );
    const user_origin_amount = formatSat(token1AddAmount, token1.decimal);

    this.formRef.current.setFieldsValue({
      origin_amount: user_origin_amount,
    });
    this.setState({
      aim_amount: value || 0,
      origin_amount: user_origin_amount,
      lp: lpMinted,
      lastMod: 'aim',
    });
  };

  setOriginBalance = () => {
    const { userBalance, pairData, token1, token2 } = this.props;
    const { swapLpAmount, swapToken1Amount, swapToken2Amount } = pairData;
    const origin_amount = userBalance.BSV || 0;

    if (swapToken1Amount === '0' && swapToken2Amount === '0') {
      //第一次添加流动性
      this.setState({
        origin_amount,
        lastMod: 'origin',
      });
      this.formRef.current.setFieldsValue({
        origin_amount,
      });
      return;
    }

    const token1AddAmount = BigNumber(origin_amount)
      .multipliedBy(Math.pow(10, token1.decimal))
      .toString();
    const [lpMinted, token2AddAmount] = countLpAddAmount(
      token1AddAmount,
      swapToken1Amount,
      swapToken2Amount,
      swapLpAmount,
    );
    const aim_amount = formatSat(token2AddAmount, token2.decimal);

    this.formRef.current.setFieldsValue({
      origin_amount,
      aim_amount,
    });
    this.setState({
      origin_amount,
      aim_amount,
      lp: lpMinted,
      lastMod: 'origin',
    });
  };

  setAimBalance = () => {
    const { userBalance, token1, token2, pairData } = this.props;
    const { swapLpAmount, swapToken1Amount, swapToken2Amount } = pairData;
    const aim_amount = userBalance[token2.tokenID] || 0;

    if (swapToken1Amount === '0' && swapToken2Amount === '0') {
      //第一次添加流动性
      this.setState({
        aim_amount,
        lastMod: 'aim',
      });
      this.formRef.current.setFieldsValue({
        aim_amount,
      });
      return;
    }
    const token2AddAmount = BigNumber(aim_amount)
      .multipliedBy(Math.pow(10, token2.decimal))
      .toString();
    const [lpMinted, token1AddAmount] = countLpAddAmountWithToken2(
      token2AddAmount,
      swapToken1Amount,
      swapToken2Amount,
      swapLpAmount,
    );
    const origin_amount = formatSat(token1AddAmount, token1.decimal);

    this.formRef.current.setFieldsValue({
      origin_amount,
      aim_amount,
    });
    this.setState({
      origin_amount,
      aim_amount,
      lp: lpMinted,
      lastMod: 'aim',
    });
  };

  showUI = (name) => {
    this.setState({
      page: name,
    });
  };

  switchPriceDir = () => {
    this.setState({
      price_dir: !this.state.price_dir,
    });
  };

  renderInfo(total_origin_amount, total_aim_amount, share) {
    const { price_dir } = this.state;
    const { token1, token2 } = this.props;
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    let _price = price_dir
      ? `1 ${symbol1} = ${formatAmount(
          total_aim_amount / total_origin_amount,
          token2.decimal,
        )} ${symbol2}`
      : `1 ${symbol2} = ${formatAmount(
          total_origin_amount / total_aim_amount,
          token1.decimal,
        )} ${symbol1}`;
    return (
      <div className={styles.my_pair_info}>
        <div className={styles.info_item}>
          <div className={styles.info_label}>{_('price')}</div>
          <div
            className={styles.info_value}
            onClick={this.switchPriceDir}
            style={{ cursor: 'pointer' }}
          >
            {_price}{' '}
            <CustomIcon
              type="iconSwitch"
              style={{
                fontSize: 22,
                backgroundColor: '#F6F6F9',
                borderRadius: '50%',
                padding: 4,
                marginLeft: 5,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  renderFormInfo() {
    const { token1, token2, pairData, userBalance, lptoken } = this.props;
    const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;
    const { origin_amount = 0, aim_amount = 0 } = this.state;

    const LP = userBalance[lptoken.tokenID] || 0;
    let rate = LP / formatSat(swapLpAmount, lptoken.decimal) || 0;

    let total_origin_amount = origin_amount,
      total_aim_amount = aim_amount;

    total_origin_amount = formatAmount(
      BigNumber(origin_amount).plus(
        BigNumber(swapToken1Amount).div(Math.pow(10, token1.decimal)),
      ),
      token1.decimal,
    ).toString();
    total_aim_amount = formatAmount(
      BigNumber(aim_amount).plus(
        BigNumber(swapToken2Amount).div(Math.pow(10, token2.decimal)),
      ),
      token2.decimal,
    ).toString();
    const share =
      origin_amount > 0
        ? formatAmount(
            BigNumber(origin_amount)
              .plus(
                BigNumber(swapToken1Amount)
                  .div(Math.pow(10, token1.decimal))
                  .multipliedBy(rate),
              )
              .div(total_origin_amount)
              .multipliedBy(100),
            4,
          )
        : 0;
    return this.renderInfo(total_origin_amount, total_aim_amount, share);
  }

  renderForm() {
    const { token1, token2, userBalance, submiting } = this.props;
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    return (
      <div className={styles.add_content}>
        <Spin spinning={submiting}>
          <Form onSubmit={this.preHandleSubmit} ref={this.formRef}>
            <div className={styles.title}>
              <h3>{_('input')}</h3>
              <div className={styles.balance} onClick={this.setOriginBalance}>
                {_('your_balance')}:{' '}
                <span>
                  {userBalance.BSV || 0} {symbol1}
                </span>
              </div>
            </div>
            <div className={styles.box}>
              <div
                className={styles.coin}
                onClick={() => this.showUI('selectToken')}
              >
                <TokenLogo name={symbol1} />
                <div className={styles.name}>{symbol1}</div>
                <DownOutlined />
              </div>
              <FormItem name={'origin_amount'}>
                <Input
                  className={styles.input}
                  onChange={this.changeOriginAmount}
                  min="0"
                  // formatter={(value) => parseFloat(value || 0)}
                />
              </FormItem>
            </div>

            <div className={styles.switch_icon}>
              <PlusOutlined style={{ fontSize: 18 }} />
            </div>

            <div className={styles.title}>
              <h3>{_('input')}</h3>
              <div className={styles.balance} onClick={this.setAimBalance}>
                {_('balance')}:{' '}
                <span>
                  {userBalance[token2.tokenID] || 0} {symbol2 || ''}
                </span>
              </div>
            </div>

            <div className={styles.box}>
              <div
                className={styles.coin}
                onClick={() => this.showUI('selectToken')}
              >
                <div style={{ width: 40 }}>
                  <TokenLogo name={symbol2} />
                </div>
                <div className={styles.name}>{symbol2 || _('select')}</div>
                <DownOutlined />
              </div>
              <FormItem name={'aim_amount'}>
                <Input
                  className={styles.input}
                  onChange={this.changeAimAmount}
                  min="0"
                  // formatter={(value) => parseFloat(value || 0)}
                />
              </FormItem>
            </div>
            {this.renderButton()}
          </Form>
        </Spin>
      </div>
    );
  }

  login() {
    EventBus.emit('login');
  }

  renderButton = () => {
    const { isLogin, token1, token2, userBalance } = this.props;
    const { origin_amount, aim_amount } = this.state;
    let btn;
    if (!isLogin) {
      // 未登录
      btn = (
        <Button className={styles.btn_wait} onClick={this.login}>
          {_('login')}
        </Button>
      );
    }
    // else if (!origin_token_id || !aim_token_id) {
    //     //未选择Token
    //     return <Button className={styles.btn_wait}>{_('select_a_token_pair')}</Button>
    // }
    else if (parseFloat(origin_amount) <= 0 || parseFloat(aim_amount) <= 0) {
      // 未输入数量
      btn = <Button className={styles.btn_wait}>{_('enter_amount')}</Button>;
    } else if (parseFloat(origin_amount) <= formatSat(1000)) {
      // 数额太小
      btn = (
        <Button className={styles.btn_wait}>{_('lower_amount', 1000)}</Button>
      );
    } else if (parseFloat(origin_amount) > parseFloat(userBalance.BSV || 0)) {
      // 余额不足
      btn = (
        <Button className={styles.btn_wait}>
          {_('lac_token_balance', token1.symbol.toUpperCase())}
        </Button>
      );
    } else if (
      parseFloat(aim_amount) > parseFloat(userBalance[token2.tokenID] || 0)
    ) {
      // 余额不足
      btn = (
        <Button className={styles.btn_wait}>
          {_('lac_token_balance', token2.symbol.toUpperCase())}
        </Button>
      );
    } else {
      btn = (
        <Button
          className={styles.btn}
          type="primary"
          onClick={this.preHandleSubmit}
        >
          {_('supply_liq')}
        </Button>
      );
    }

    return (
      <div>
        {this.renderFormInfo()}
        <div className={styles.warning}>
          {parseFloat(origin_amount) > 0 &&
          parseFloat(origin_amount) + 0.0012 > parseFloat(userBalance.BSV || 0)
            ? _('addliq_warning')
            : ''}
        </div>
        {btn}
      </div>
    );
  };

  showModal = ({
    origin_amount,
    aim_amount,
    new_aim_amount,
    new_origin_amount,
  }) => {
    const { token1, token2 } = this.props;
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    Modal.confirm({
      title: _('liq_price_change_title'),
      icon: '',
      onOk: this.handleOk,
      content: _('liq_price_change_contnet')
        .replace('%1', `${origin_amount}${symbol1} + ${aim_amount}${symbol2}`)
        .replace(
          '%2',
          `${new_origin_amount}${symbol1} + ${new_aim_amount}${symbol2}`,
        ),
      okText: _('continue_add_liq'),
      cancelText: _('cancel'),
    });
  };
  handleOk = () => {
    this.setState({
      modalVisible: false,
    });
    this.handleSubmit();
  };
  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };

  preHandleSubmit = async () => {
    const { dispatch, currentPair, userAddress, token1, token2, userBalance } =
      this.props;

    let res = await dispatch({
      type: 'pair/reqSwap',
      payload: {
        symbol: currentPair,
        address: userAddress,
        op: 1,
      },
    });

    const { code, data, msg } = res;
    if (code) {
      return message.error(msg);
    }

    this.setState({
      reqSwapData: data,
    });
    const { swapToken1Amount, swapToken2Amount, swapLpAmount, txFee } = data;

    let { origin_amount, aim_amount, lastMod } = this.state;
    let _origin_amount, _aim_amount;

    // console.log(BigNumber(txFee + 100000).toString(),
    // BigNumber(txFee + 100000).div(Math.pow(10, token1.decimal)).toString(),
    //   BigNumber(origin_amount)
    // .plus(
    //   BigNumber(txFee + 100000).div(Math.pow(10, token1.decimal))
    // ).toString(), BigNumber(origin_amount)
    // .plus(
    //   BigNumber(txFee + 100000).div(Math.pow(10, token1.decimal))
    // )
    // .isGreaterThan(userBalance.BSV || 0))
    if (
      BigNumber(origin_amount)
        .plus(BigNumber(txFee + 100000).div(Math.pow(10, token1.decimal)))
        .isGreaterThan(userBalance.BSV || 0)
    ) {
      //余额不足支付矿工费，在金额中扣除矿工费
      origin_amount = BigNumber(origin_amount).minus(
        BigNumber(txFee + 100000).div(Math.pow(10, token1.decimal)),
      );
      if (origin_amount.toNumber() <= 0) {
        return message.error(_('lac_token_balance', 'BSV'));
      }
      // origin_amount =.toString();
      lastMod = 'origin';
    }

    if (lastMod === 'origin') {
      const token1AddAmount = BigNumber(origin_amount)
        .multipliedBy(Math.pow(10, token1.decimal))
        .toString();
      let token2AddAmount;
      if (swapToken1Amount === '0' && swapToken2Amount === '0') {
        token2AddAmount = BigNumber(aim_amount)
          .multipliedBy(Math.pow(10, token2.decimal))
          .toString();
      } else {
        token2AddAmount = countLpAddAmount(
          token1AddAmount,
          swapToken1Amount,
          swapToken2Amount,
          swapLpAmount,
        )[1];
      }

      // const new_aim_amount = formatSat(token2AddAmount, token2.decimal);

      _origin_amount = token1AddAmount;
      _aim_amount = token2AddAmount;

      // if (new_aim_amount !== aim_amount) {
      //   this.setState({
      //     _origin_amount,
      //     _aim_amount,
      //   });
      // return this.showModal({
      //   origin_amount,
      //   aim_amount,
      //   new_origin_amount: origin_amount,
      //   new_aim_amount,
      // });
      // }
    } else if (lastMod === 'aim') {
      const token2AddAmount = BigNumber(aim_amount)
        .multipliedBy(Math.pow(10, token2.decimal))
        .toString();
      let token1AddAmount;

      if (swapToken1Amount === '0' && swapToken2Amount === '0') {
        token1AddAmount = BigNumber(origin_amount)
          .multipliedBy(Math.pow(10, token1.decimal))
          .toString();
      } else {
        token1AddAmount = countLpAddAmountWithToken2(
          token2AddAmount,
          swapToken1Amount,
          swapToken2Amount,
          swapLpAmount,
        )[1];
      }

      // const new_origin_amount = formatSat(token1AddAmount, token1.decimal);

      _origin_amount = token1AddAmount;
      _aim_amount = token2AddAmount;
      // if (new_origin_amount !== origin_amount) {
      // return this.showModal({
      //   origin_amount,
      //   aim_amount,
      //   new_origin_amount,
      //   new_aim_amount: aim_amount,
      // });
      // }
    }

    this.setState({
      _origin_amount: _origin_amount.toString(),
      _aim_amount: _aim_amount.toString(),
    });
    this.handleSubmit(data, _origin_amount, _aim_amount);
  };
  handleSubmit = async (data, _origin_amount, _aim_amount) => {
    if (!_origin_amount) _origin_amount = this.state._origin_amount;
    if (!_aim_amount) _aim_amount = this.state._aim_amount;
    const { token2, currentPair, dispatch, rabinApis, changeAddress } =
      this.props;
    const { reqSwapData } = this.state;
    const { bsvToAddress, tokenToAddress, requestIndex, txFee } =
      reqSwapData || data;

    let tx_res = await dispatch({
      type: 'user/transferAll',
      payload: {
        datas: [
          {
            type: 'bsv',
            address: bsvToAddress,
            amount: (BigInt(_origin_amount) + BigInt(txFee)).toString(),
            changeAddress,
            noBroadcast: true,
          },
          {
            type: 'sensibleFt',
            address: tokenToAddress,
            amount: _aim_amount.toString(),
            changeAddress,
            codehash: token2.codeHash,
            genesis: token2.tokenID,
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
      token2RawTx: tx_res[1].txHex,
      token2OutputIndex: 0,
      token1AddAmount: _origin_amount.toString(),
      amountCheckRawTx: tx_res[1].routeCheckTxHex,
    };
    liq_data = JSON.stringify(liq_data);
    liq_data = await gzip(liq_data);
    const addliq_res = await dispatch({
      type: 'pair/addLiq',
      payload: {
        data: liq_data,
      },
    });
    // console.log(addliq_res)
    if (addliq_res.code && !addliq_res.data.txid) {
      return message.error(addliq_res.msg);
    }
    message.success('success');
    await this.updateData();
    this.setState({
      formFinish: true,
      lpAddAmount: addliq_res.data.lpAddAmount,
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
    EventBus.emit('reloadChart', 'pool');
    dispatch({
      type: 'user/loadingUserData',
      payload: {},
    });
  }

  renderResult() {
    const { token1, token2, history, allPairs, currentPair } = this.props;
    const { _origin_amount, _aim_amount, lpAddAmount } = this.state;
    const { lptoken = {} } = allPairs[currentPair];
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    return (
      <div className={styles.add_content}>
        <div className={styles.finish_logo}>
          <CustomIcon
            type="iconicon-success"
            style={{ fontSize: 80, color: '#2BB696' }}
          />
        </div>
        <div className={styles.finish_title}>{_('add_success')}</div>
        <div className={styles.result_data1}>
          {_('added')} {formatSat(_origin_amount, token1.decimal)} {symbol1} +{' '}
          {formatSat(_aim_amount, token2.decimal)} {symbol2}
        </div>
        <div className={styles.result_data2}>
          {_('received')} {formatSat(lpAddAmount, lptoken.decimal)}
          <TokenPair
            symbol1={symbol1}
            symbol2={symbol2}
            size={20}
            style={{ marginLeft: 10 }}
          />{' '}
          <span style={{ fontWeight: 700, marginLeft: 10 }}>
            {symbol1}/{symbol2}-LP
          </span>
        </div>
        {/*this.renderResultInfo()*/}
        <Button
          className={styles.done_btn}
          onClick={() => {
            history.push('/swap');
          }}
        >
          {_('done')}
        </Button>
      </div>
    );
  }

  renderSwap() {
    if (!this.props.currentPair) return 'No pair';
    const { formFinish, page } = this.state;

    return (
      <div
        className={styles.container}
        style={{ display: page === 'form' ? 'block' : 'none' }}
      >
        <div className={styles.head}>
          <div className={styles.menu}>
            <span
              className={jc(styles.menu_item, styles.menu_item_selected)}
              key="add_liq"
            >
              {_('add_liq')}
            </span>
            <span
              className={styles.menu_item}
              key="remove_liq"
              onClick={() => {
                this.props.history.push('remove');
              }}
            >
              {_('remove_liq_short')}
            </span>
          </div>
        </div>
        {formFinish ? this.renderResult() : this.renderForm()}
      </div>
    );
  }

  selectedToken = async (currentPair) => {
    this.showUI('form');

    if (!currentPair) return;
    this.setState({
      origin_amount: 0,
      aim_amount: 0,
      lastMod: '',
    });

    this.formRef.current.setFieldsValue({ origin_amount: 0, aim_amount: 0 });
  };

  render() {
    const { loading } = this.props;
    if (loading) return <Loading />;
    const { page } = this.state;
    return (
      <Pool>
        <div style={{ position: 'relative' }}>
          {this.renderSwap()}
          {page === 'selectToken' && (
            <div className={styles.selectToken_wrap}>
              <SelectToken finish={(id) => this.selectedToken(id, page)} />
            </div>
          )}
        </div>
      </Pool>
    );
  }
}
