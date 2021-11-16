'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { gzip, ungzip } from 'node-gzip';
import { Button, message } from 'antd';
import EventBus from 'common/eventBus';
import { LeastFee } from 'common/utils';
import CustomIcon from 'components/icon';
import FormatNumber from 'components/formatNumber';
import Loading from 'components/loading';
import Rate from 'components/rate';
import styles from '../deposit/index.less';
import _ from 'i18n';

import BigNumber from 'bignumber.js';
import FarmPairIcon from 'components/pairIcon/farmIcon';
import { LoginBtn, EnterAmountBtn } from 'components/btns';

@connect(({ user, pair, farm, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...farm,
    ...pair,
    loading: effects['farm/getAllPairs'],
  };
})
export default class Withdraw extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addLP: 0,
      formFinish: false,
      price: 0,
      blockHeight: 0,
    };
  }

  componentDidMount() {
    EventBus.on('changeFarmPair', () => {
      this.changeData(0);
      this.clear();
    });
  }

  updateData() {
    const { dispatch, accountInfo } = this.props;
    dispatch({
      type: 'farm/getAllPairs',
      payload: {
        address: accountInfo.userAddress,
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
    const { currentFarmPair, loading, lockedTokenAmount } = this.props;
    if (loading || !currentFarmPair) return <Loading />;
    return (
      <div className={styles.content}>
        <Rate
          type="farm"
          changeAmount={this.changeData}
          balance={lockedTokenAmount}
          tokenPair={<FarmPairIcon keyword="pair" />}
        />
        {this.renderButton()}
      </div>
    );
  }

  withdraw2 = async (withdraw_data, requestIndex) => {
    const { txHex, scriptHex, satoshis, inputIndex } = withdraw_data;
    const { dispatch, currentFarmPair, accountInfo } = this.props;

    let sign_res = await dispatch({
      type: 'user/signTx',
      payload: {
        datas: {
          txHex,
          scriptHex,
          satoshis,
          inputIndex,
          address: accountInfo.userAddress,
        },
      },
    });

    if (sign_res.msg && !sign_res.sig) {
      return message.error(sign_res);
    }
    if (sign_res[0]) {
      sign_res = sign_res[0];
    }

    const { publicKey, sig } = sign_res;

    const withdraw2_res = await dispatch({
      type: 'farm/withdraw2',
      payload: {
        symbol: currentFarmPair,
        requestIndex,
        pubKey: publicKey,
        sig,
      },
    });
    const { code, data, msg } = withdraw2_res;
    if (code === 99999) {
      const raw = await ungzip(Buffer.from(data.other));
      const newData = JSON.parse(raw.toString());
      return this.withdraw2(newData, requestIndex);
    }

    return withdraw2_res;
  };

  handleSubmit = async () => {
    const { addLP } = this.state;
    const { dispatch, currentFarmPair, accountInfo, allFarmPairs } = this.props;
    const { userAddress, userBalance, changeAddress } = accountInfo;
    const lptoken = allFarmPairs[currentFarmPair].token;

    let res = await dispatch({
      type: 'farm/reqSwap',
      payload: {
        symbol: currentFarmPair,
        address: userAddress,
        op: 2,
      },
    });

    if (res.code) {
      return message.error(res.msg);
    }

    const { requestIndex, bsvToAddress, txFee } = res.data;

    const isLackBalance = LeastFee(txFee, userBalance.BSV);
    if (isLackBalance.code) {
      return message.error(isLackBalance.msg);
    }

    const _value = BigNumber(addLP)
      .multipliedBy(Math.pow(10, lptoken.decimal))
      .toFixed(0);
    let tx_res = await dispatch({
      type: 'user/transferBsv',
      payload: {
        address: bsvToAddress,
        amount: txFee,
        note: 'tswap.io(farm withdraw)',
        changeAddress,
        noBroadcast: true,
      },
    });
    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }

    if (tx_res.list) {
      tx_res = tx_res.list[0];
    }

    if (!tx_res.txHex) {
      return message.error(_('txs_fail'));
    }

    let data = {
      symbol: currentFarmPair,
      requestIndex,
      tokenRemoveAmount: _value,
      bsvRawTx: tx_res.txHex,
      bsvOutputIndex: 0,
    };
    data = JSON.stringify(data);
    data = await gzip(data);
    const withdraw_res = await dispatch({
      type: 'farm/withdraw',
      payload: {
        data,
      },
    });

    if (withdraw_res.code) {
      return message.error(withdraw_res.msg);
    }
    const withdraw2_res = await this.withdraw2(withdraw_res.data, requestIndex);
    if (withdraw2_res.code && withdraw2_res.msg) {
      return message.error(withdraw2_res.msg);
    }

    if (!withdraw2_res.code && withdraw2_res.data.txid) {
      message.success('success');
      this.updateData();
      this.setState({
        formFinish: true,
        blockHeight: withdraw2_res.data.blockHeight,
      });
    } else {
      return message.error(withdraw2_res.msg);
    }
  };

  renderButton() {
    const { isLogin, lockedTokenAmount } = this.props;
    const { addLP } = this.state;
    // console.log(addLP, lockedTokenAmount)
    if (!isLogin) {
      // 未登录
      return <LoginBtn />;
    } else if (addLP <= 0) {
      // 不存在的交易对
      return <EnterAmountBtn />;
    } else if (BigNumber(addLP).isGreaterThan(lockedTokenAmount)) {
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
          {_('withdraw')}
        </Button>
      );
    }
  }

  clear() {
    this.setState({
      formFinish: false,
      addLP: 0,
    });
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
          {_('withdraw_success')}@block{blockHeight}
        </div>
        <div className={styles.small_title}>{_('withdrew')}</div>

        <div className={styles.pair_data}>
          <div className={styles.pair_left}>
            <FormatNumber value={addLP} />
          </div>
          <div className={styles.pair_right}>
            <FarmPairIcon keyword="pair" />
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
