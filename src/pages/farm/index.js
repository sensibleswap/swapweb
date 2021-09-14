'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import { Button, Tooltip, message, Spin, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { gzip } from 'node-gzip';
import BigNumber from 'bignumber.js';
import pairApi from '../../api/pair';
import { jc, formatSat, formatAmount } from 'common/utils';
import EventBus from 'common/eventBus';
import TokenLogo from 'components/tokenicon';
import TokenPair from 'components/tokenPair';
import CustomIcon from 'components/icon';
import Header from '../layout/header';
import Deposit from '../deposit';
import Withdraw from '../withdraw';
import Loading from 'components/loading';
// import debug from 'debug';
import styles from './index.less';
import _ from 'i18n';
// const log = debug('farm');

@withRouter
@connect(({ user, farm, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...farm,
    loading: effects['farm/getAllPairs'] || false,
    submiting:
      effects['farm/reqSwap'] ||
      effects['farm/harvest'] ||
      effects['farm/harvest2'] ||
      effects['user/transferBsv'] ||
      effects['user/signTx'] ||
      false,
  };
})
export default class FarmC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app_pannel: false,
      current_item: 0,
      currentMenuIndex: 0,
      pairData: {},
    };
  }

  componentDidMount() {
    EventBus.on('reloadPair', this.fetch);
    this.fetch();
  }

  fetch = async () => {
    const { dispatch, userAddress } = this.props;
    await dispatch({
      type: 'farm/getAllPairs',
      payload: {
        address: userAddress,
      },
    });
    const { currentPair } = this.props;

    const res = await pairApi.querySwapInfo(currentPair);

    this.setState({
      pairData: res.data,
    });
    // let { currentPair } = this.props;
    // log('currentPair:', currentPair);
    // if (currentPair) {
    //   await dispatch({
    //     type: 'farm/getPairData',
    //     payload: {
    //       currentPair,
    //     },
    //   });
    // }
  };

  showPannel = () => {
    this.setState({
      app_pannel: true,
    });
  };

  hidePannel = () => {
    this.setState({
      app_pannel: false,
    });
  };

  changeCurrentFarm = async (currentPair) => {
    const { allPairs, dispatch } = this.props;
    dispatch({
      type: 'farm/saveFarm',
      payload: {
        currentPair,
        allPairs,
      },
    });

    const res = await pairApi.querySwapInfo(currentPair);

    this.setState({
      pairData: res.data,
    });
  };

  harvest = async (currentPair, params) => {
    const { dispatch, userAddress } = this.props;

    let res = await dispatch({
      type: 'farm/reqSwap',
      payload: {
        symbol: currentPair,
        address: userAddress,
        op: 3,
      },
    });

    if (res.code) {
      return message.error(res.msg);
    }

    const { requestIndex, bsvToAddress, txFee } = res.data;
    const tx_res = await dispatch({
      type: 'user/transferBsv',
      payload: {
        address: bsvToAddress,
        amount: txFee,
        noBroadcast: true,
      },
    });

    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }

    let hav_data = {
      symbol: currentPair,
      requestIndex,
      bsvRawTx: tx_res.txHex,
      bsvOutputIndex: 0,
    };
    hav_data = JSON.stringify(hav_data);
    hav_data = await gzip(hav_data);
    const harvest_res = await dispatch({
      type: 'farm/harvest',
      payload: {
        data: hav_data,
      },
    });

    if (harvest_res.code) {
      return message.error(harvest_res.msg);
    }
    const { txHex, scriptHex, satoshis, inputIndex } = harvest_res.data;
    const sign_res = await dispatch({
      type: 'user/signTx',
      payload: {
        datas: {
          txHex,
          scriptHex,
          satoshis,
          inputIndex,
          address: userAddress,
        },
      },
    });

    if (sign_res.msg && !sign_res.sig) {
      return message.error(sign_res);
    }
    const { publicKey, sig } = sign_res;
    const harvest2_res = await dispatch({
      type: 'farm/harvest2',
      payload: {
        symbol: currentPair,
        requestIndex,
        pubKey: publicKey,
        sig,
      },
    });
    const { code, data, msg } = harvest2_res;
    const amount = formatSat(
      data.rewardTokenAmount,
      params.rewardToken.decimal,
    );
    if (!code && data.txid) {
      // message.success('success');
      this.showModal(amount, data.txid, params.rewardToken.symbol);
      this.fetch();
    } else {
      return message.error(msg);
    }
  };
  showModal(amount, txid, symbol) {
    Modal.info({
      title: '',
      content: (
        <div className={styles.mod_content}>
          <div className={styles.icon}>
            <CustomIcon
              type="iconicon-success"
              style={{ fontSize: 60, fontWeight: 'bold', color: '#2BB696' }}
            />
          </div>
          <div className={styles.amount}>
            <span style={{ marginRight: 30 }}>{amount}</span>
            <TokenLogo
              name={symbol}
              style={{ fontSize: 20, marginRight: 10 }}
            />
            <span className={styles.symbol}>{symbol}</span>
          </div>
          <div className={styles.txt}>{_('harvest_success')}</div>
          <div className={styles.txid}>{`Txid: ${txid}`}</div>
        </div>
      ),
      className: styles.mod,
      icon: '',
      width: 375,
    });
  }

  renderItem(pairName, data, index) {
    const { loading, dispatch, bsvPrice, currentPair } = this.props;
    const [symbol1, symbol2] = pairName.toUpperCase().split('-');
    const {
      poolTokenAmount,
      rewardAmountPerBlock,
      rewardTokenAmount = 0,
      rewardToken,
    } = data;
    const { decimal } = rewardToken;
    const { current_item, pairData = {} } = this.state;
    if (loading) {
      return null;
    }
    const {
      swapLpAmount = 0,
      swapToken1Amount = 0,
      swapToken2Amount = 0,
    } = pairData;
    const _rewardTokenAmount = formatSat(rewardTokenAmount || 0, decimal);
    const bsv_amount = formatSat(swapToken1Amount);
    const token_amount = formatSat(swapToken2Amount, decimal);
    const lp_amount = formatSat(swapLpAmount, decimal);
    const lp_price =
      lp_amount > 0 ? BigNumber(bsv_amount * 2).div(lp_amount) : 0;
    const token_price =
      token_amount > 0 ? BigNumber(bsv_amount).div(token_amount) : 0;
    const reword_amount = formatSat(rewardAmountPerBlock, decimal);
    let _total = BigNumber(formatSat(poolTokenAmount, decimal))
      .multipliedBy(lp_price)
      .multipliedBy(bsvPrice);

    if (_total.isGreaterThan(1000000)) {
      _total = formatAmount(_total.div(1000000), 2);
      _total = _total + 'm';
    } else if (_total.isGreaterThan(1000)) {
      _total = formatAmount(_total.div(1000), 2);
      _total = _total + 'k';
    } else {
      _total = formatAmount(_total, 2);
    }

    let _yield = '0.00';
    if (lp_price > 0 && poolTokenAmount > 0) {
      _yield = BigNumber(reword_amount)
        .multipliedBy(144)
        .multipliedBy(365)
        .multipliedBy(token_price)
        .div(BigNumber(poolTokenAmount).multipliedBy(lp_price))
        .multipliedBy(100);

      _yield = formatAmount(_yield, 2);
    }
    if (current_item === index) {
      dispatch({
        type: 'farm/save',
        payload: {
          currentPairYield: _yield,
        },
      });
    }

    return (
      <div
        className={
          pairName === currentPair
            ? jc(styles.item, styles.current)
            : styles.item
        }
        key={pairName}
        onClick={() => this.changeCurrentFarm(pairName)}
      >
        <div className={styles.item_title}>
          <div className={styles.icon}>
            <TokenPair symbol1={symbol2} symbol2={symbol1} size={20} />
          </div>
          <div className={styles.name}>
            {symbol2}/{symbol1}
          </div>
        </div>
        <div className={styles.item_desc}>
          {_('farm_item_desc')
            .replace(/%1/g, `${pairName.toUpperCase()}`)
            .replace('%2', rewardToken.symbol)}
        </div>
        <div className={styles.item_data}>
          <div className={styles.item_data_left}>
            <div className={styles.label}>{_('tvl')}</div>
            <div className={styles.value}>{_total} USDT</div>
          </div>
          <div className={styles.item_data_right}>
            <Tooltip
              title={_('apy_info').replace(/%1/g, rewardToken.symbol)}
              placement="bottom"
            >
              <div
                className={styles.label}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {_('apy')}
                <CustomIcon
                  type="iconi"
                  style={{
                    border: '1px solid #e8e8e8',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    fontSize: 15,
                    padding: 2,
                    width: 15,
                    textAlign: 'center',
                    marginLeft: 10,
                  }}
                />
              </div>
            </Tooltip>
            <div className={styles.value}>{_yield}%</div>
          </div>
        </div>
        <div className={styles.item_action}>
          <div className={styles.item_action_data}>
            <div style={{ width: 78 }}>
              <Tooltip title={_('payout_tips')} placement="bottom">
                <div className={styles.label}>
                  {_('payout')}
                  <CustomIcon
                    type="iconi"
                    style={{
                      border: '1px solid #e8e8e8',
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      fontSize: 15,
                      padding: 2,
                      width: 15,
                      textAlign: 'center',
                      marginLeft: 10,
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </Tooltip>
              <div className={styles.value}>{reword_amount.toString()}</div>
            </div>
            <div>
              <div className={styles.label}>
                {_('crop')}({rewardToken.symbol}):
              </div>
              <Tooltip
                title={`${_('yield_tips', _rewardTokenAmount)} ${
                  rewardToken.symbol
                }`}
                placement="bottom"
              >
                <div
                  className={styles.value}
                  style={{ fontSize: 12, color: '#2F80ED' }}
                >
                  {formatAmount(_rewardTokenAmount, rewardToken.decimal)}
                </div>
              </Tooltip>
            </div>
          </div>
          <Button
            type="primary"
            className={styles.btn}
            disabled={rewardTokenAmount <= 0}
            onClick={() => this.harvest(pairName, data)}
          >
            {_('harvest')}
          </Button>
        </div>
      </div>
    );
  }

  renderContent() {
    const { allPairs } = this.props;
    return (
      <div className={styles.content}>
        <div className={styles.items}>
          {Object.keys(allPairs).map((item, index) => {
            return this.renderItem(item, allPairs[item], index);
          })}
        </div>
      </div>
    );
  }

  render() {
    const { app_pannel, currentMenuIndex } = this.state;

    return (
      <Spin spinning={this.props.submiting}>
        <section className={styles.container}>
          <section
            className={
              app_pannel ? jc(styles.left, styles.app_hide) : styles.left
            }
          >
            <div className={styles.left_inner}>
              <Header />
              {this.renderContent()}
              <Button
                type="primary"
                className={styles.app_start_btn}
                onClick={this.showPannel}
              >
                {_('start_deposit')}
              </Button>
            </div>
          </section>
          <section className={styles.right}>
            <div
              className={
                app_pannel
                  ? styles.sidebar
                  : jc(styles.sidebar, styles.app_hide)
              }
            >
              <div className={styles.app_title}>
                {_('farm')}
                <div className={styles.close} onClick={this.hidePannel}>
                  <CloseOutlined />
                </div>
              </div>

              <div className={styles.right_box}>
                <div className={styles.head}>
                  <div className={styles.menu}>
                    {['deposit', 'withdraw'].map((item, index) => (
                      <span
                        className={
                          index === currentMenuIndex
                            ? jc(styles.menu_item, styles.menu_item_selected)
                            : styles.menu_item
                        }
                        key={item}
                        onClick={() => {
                          this.setState({
                            currentMenuIndex: index,
                          });
                        }}
                      >
                        {_(item)}
                      </span>
                    ))}
                  </div>
                </div>
                {currentMenuIndex === 0 && <Deposit />}
                {currentMenuIndex === 1 && <Withdraw />}
              </div>
            </div>
          </section>
        </section>
      </Spin>
    );
  }
}
