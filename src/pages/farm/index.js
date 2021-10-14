'use strict';
import React, { Component } from 'react';
import { connect, history } from 'umi';
import { Button, Tooltip, message, Spin, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { gzip, ungzip } from 'node-gzip';
import BigNumber from 'bignumber.js';
// import pairApi from '../../api/pair';
import { jc, formatSat, formatAmount, tokenPre } from 'common/utils';
import EventBus from 'common/eventBus';
import FormatNumber from 'components/formatNumber';
import TokenLogo from 'components/tokenicon';
import TokenPair from 'components/tokenPair';
import CustomIcon from 'components/icon';
import Header from '../layout/header';
import Deposit from '../deposit';
import Withdraw from '../withdraw';
// import debug from 'debug';
import styles from './index.less';
import _ from 'i18n';
// const log = debug('farm');

@connect(({ pair, user, farm, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    ...user,
    ...farm,
    loading:
      effects['farm/getAllPairs'] ||
      effects['farm/getPairData'] ||
      effects['pair/getAllPairs'] ||
      false,
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
    };
    window.addEventListener('hashchange', (event) => {
      const { newURL, oldURL } = event;
      if (newURL !== oldURL) {
        let newHash = newURL.substr(newURL.indexOf('#'));
        let oldHash = oldURL.substr(oldURL.indexOf('#'));
        newHash = newHash.split('/');
        oldHash = oldHash.split('/');
        if (
          newHash[1] === oldHash[1] &&
          newHash[2] &&
          newHash[2] !== oldHash[2]
          // && props.allFarmPairs[newHash[2]]
        ) {
          EventBus.emit('changeFarmPair');
          props.dispatch({
            type: 'farm/saveFarm',
            payload: {
              currentPair: newHash[2],
            },
          });
        }
      }
    });
  }

  componentDidMount() {
    EventBus.on('reloadPair', this.fetch);
    this.fetch();
  }

  fetch = async () => {
    const { dispatch, accountInfo } = this.props;
    const { userAddress } = accountInfo;
    dispatch({
      type: 'farm/getAllPairs',
      payload: {
        address: userAddress,
      },
    });
    dispatch({
      type: 'pair/getAllPairs',
      payload: {},
    });
  };

  showPannel = (index) => {
    this.setState({
      app_pannel: true,
      currentMenuIndex: index,
    });
  };

  hidePannel = () => {
    this.setState({
      app_pannel: false,
    });
  };

  changeCurrentFarm = async (currentPair) => {
    const { allFarmPairs, dispatch } = this.props;

    let { hash } = location;
    if (hash.indexOf('farm') > -1) {
      history.push(`/farm/${currentPair}`);
    }
    dispatch({
      type: 'farm/saveFarm',
      payload: {
        currentPair,
        allFarmPairs,
      },
    });
  };

  harvest2 = async (havest_data, currentPair, requestIndex) => {
    const { dispatch, accountInfo } = this.props;
    const { txHex, scriptHex, satoshis, inputIndex } = havest_data;
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
    if (code === 99999) {
      const raw = await ungzip(Buffer.from(data.other));
      const newData = JSON.parse(raw.toString());
      return this.harvest2(newData, currentPair, requestIndex);
    }
    return harvest2_res;
  };

  harvest = async (currentPair, params) => {
    const { dispatch, accountInfo } = this.props;
    const { userAddress, changeAddress } = accountInfo;

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
    let tx_res = await dispatch({
      type: 'user/transferBsv',
      payload: {
        address: bsvToAddress,
        amount: txFee,
        changeAddress,
        note: 'tswap.io(farm harvest)',
        noBroadcast: true,
      },
    });

    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }

    if (tx_res.list) {
      tx_res = tx_res.list[0];
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
    const harvest2_res = await this.harvest2(
      harvest_res.data,
      currentPair,
      requestIndex,
    );
    if (harvest2_res.code && harvest2_res.msg) {
      return message.error(harvest2_res.msg);
    }
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
            <span style={{ marginRight: 30 }}>
              <FormatNumber value={amount} />
            </span>
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
    const { loading, dispatch, bsvPrice, currentPair, pairsData } = this.props;

    if (loading || !pairsData[pairName]) {
      return null;
    }
    const [symbol1, symbol2] = pairName.toUpperCase().split('-');
    const {
      token,
      lockedTokenAmount,
      poolTokenAmount,
      rewardAmountPerBlock,
      rewardTokenAmount = 0,
      rewardToken,
    } = data;

    const { decimal, symbol } = rewardToken;
    const {
      swapLpAmount = 0,
      swapToken1Amount = 0,
      // swapToken2Amount = 0,
    } = pairsData[pairName];
    //swapLpAmount和poolTokenAmount是lp的数量，是不带精度的！
    const _rewardTokenAmount = formatSat(rewardTokenAmount, decimal);
    const bsv_amount = formatSat(swapToken1Amount);
    // const token_amount = formatSat(swapToken2Amount, decimal);
    // const lp_amount = formatSat(swapLpAmount, decimal);
    const lp_price = BigNumber(bsv_amount * 2).div(swapLpAmount);

    const reward_symbol = `${tokenPre()}${symbol.toLowerCase()}`;
    const reward_token = pairsData[reward_symbol];
    if (!reward_token) {
      return null;
    }
    const reward_bsv_amount = formatSat(reward_token.swapToken1Amount);
    const reward_token_amount = formatSat(
      reward_token.swapToken2Amount,
      decimal,
    );
    const token_price = BigNumber(reward_bsv_amount).div(reward_token_amount);

    const reword_amount = formatSat(rewardAmountPerBlock, decimal);
    let _total = BigNumber(poolTokenAmount)
      .multipliedBy(lp_price)
      .multipliedBy(bsvPrice);

    // if (_total.isGreaterThan(1000000)) {
    //   _total = formatAmount(_total.div(1000000), 2);
    //   _total = _total + 'm';
    // } else if (_total.isGreaterThan(1000)) {
    //   _total = formatAmount(_total.div(1000), 2);
    //   _total = _total + 'k';
    // } else {
    //   _total = formatAmount(_total, 2);
    // }

    let _yield = BigNumber(reword_amount)
      .multipliedBy(144)
      .multipliedBy(365)
      .multipliedBy(token_price)
      .div(BigNumber(poolTokenAmount).multipliedBy(lp_price))
      .multipliedBy(100);

    _yield = formatAmount(_yield, 2);
    let { pairYields } = this.props;
    pairYields[pairName] = _yield;
    dispatch({
      type: 'farm/save',
      payload: {
        pairYields,
      },
    });

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
        <div className={styles.item_header}>
          <div className={styles.item_title}>
            <div className={styles.icon}>
              <TokenPair symbol1={symbol2} symbol2={symbol1} size={20} />
            </div>
            <div className={styles.name}>
              {symbol2}/{symbol1}
            </div>
          </div>
          <div className={styles.lp_amount}>
            {_('your_deposited_lp')}:{' '}
            <FormatNumber value={formatSat(lockedTokenAmount, token.decimal)} />
          </div>
        </div>

        <div className={styles.item_data}>
          <div>
            <div className={styles.label}>{_('tvl')}</div>
            <div className={styles.value}>
              <FormatNumber value={_total} useAbbr={true} suffix="USDT" />
            </div>
          </div>
          <div>
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
            <div className={styles.value}>
              <FormatNumber value={_yield} />%
            </div>
          </div>
          <div>
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
                    marginLeft: 8,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </Tooltip>
            <div className={styles.value}>
              <FormatNumber value={reword_amount} />
            </div>
          </div>
          <div className={styles.item_detail_line_2}>
            <div className={styles.label}>
              {_('crop')} ({rewardToken.symbol}):
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
                <FormatNumber
                  value={formatAmount(_rewardTokenAmount, rewardToken.decimal)}
                />
              </div>
            </Tooltip>
          </div>

          <div className={styles.item_detail_line_2}>
            <Button
              className={styles.btn}
              type="primary"
              shape="round"
              disabled={rewardTokenAmount <= 0}
              onClick={() => this.harvest(pairName, data)}
            >
              {_('harvest')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderContent() {
    const { allFarmPairs } = this.props;
    return (
      <div className={styles.content}>
        <div className={styles.farm_intro}>{_('farm_desc')}</div>
        <div className={styles.items}>
          {Object.keys(allFarmPairs).map((item, index) => {
            return this.renderItem(item, allFarmPairs[item], index);
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
              <div className={styles.app_start_btn_wrap}>
                <Button
                  type="primary"
                  shape="round"
                  className={styles.small_btn}
                  onClick={() => this.showPannel(0)}
                >
                  {_('deposit_lp')}
                </Button>
                <Button
                  type="primary"
                  shape="round"
                  className={styles.small_btn}
                  onClick={() => this.showPannel(1)}
                >
                  {_('withdraw_lp')}
                </Button>
              </div>
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
