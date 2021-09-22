'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { jc } from 'common/utils';
import { TSWAP_POOL_SHOW_OP } from 'common/const';
import Pair from 'components/pair';
import Chart from 'components/chart/poolChart';
import Loading from 'components/loading';
import TokenPair from 'components/tokenPair';
import Notice from 'components/notice';
import Header from '../layout/header';
import styles from './index.less';
import _ from 'i18n';

@withRouter
@connect(({ user, pair, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...pair,
    loading: effects['pair/getAllPairs'] || effects['pair/getPairData'],
  };
})
export default class Pool extends Component {
  constructor(props) {
    super(props);
    const flag = sessionStorage.getItem(TSWAP_POOL_SHOW_OP);
    this.state = {
      app_pannel: flag === 'true',
    };
  }

  showPannel = (type) => {
    const { history, currentPair } = this.props;
    history.push(`/pool/${currentPair}/${type}`);
    sessionStorage.setItem(TSWAP_POOL_SHOW_OP, 'true');
    this.setState({
      app_pannel: true,
    });
  };

  hidePannel = () => {
    sessionStorage.setItem(TSWAP_POOL_SHOW_OP, 'false');
    this.setState({
      app_pannel: false,
    });
  };

  renderContent() {
    const {
      currentPair,
      pairData,
      loading,
      allPairs,
      userBalance,
    } = this.props;
    if (loading || !currentPair) return <Loading />;

    const { token1, token2 } = allPairs[currentPair];
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    return (
      <div className={styles.content}>
        <Chart symbol1={symbol1} symbol2={symbol2} />
        <div className={styles.main_title}>
          <h2>
            <div className={styles.icon}>
              <TokenPair symbol1={symbol1} symbol2={symbol2} size={30} />
            </div>
            <div className={styles.name}>
              LP({symbol2}/{symbol1})
            </div>
          </h2>
          {/*<div className={styles.subtitle}>{_('your_liq')}</div>
    <div className={styles.fiat}>$</div>*/}
        </div>
        <Pair
          pairData={pairData}
          curPair={allPairs[currentPair]}
          userBalance={userBalance}
        />
      </div>
    );
  }

  render() {
    const { app_pannel } = this.state;

    return (
      <>
        <Notice />
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
                  onClick={() => this.showPannel('add')}
                >
                  {_('add_liq')}
                </Button>
                <Button
                  type="primary"
                  shape="round"
                  className={styles.small_btn}
                  onClick={() => this.showPannel('remove')}
                >
                  {_('remove_liq')}
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
                {_('pool')}
                <div className={styles.close} onClick={this.hidePannel}>
                  <CloseOutlined />
                </div>
              </div>

              {this.props.children}
            </div>
          </section>
        </section>
      </>
    );
  }
}
