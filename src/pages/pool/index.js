'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import { Button, Alert } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { jc } from 'common/utils';
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
    this.state = {
      app_pannel: false,
    };
  }

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
              <Button
                type="primary"
                className={styles.app_start_btn}
                onClick={this.showPannel}
              >
                {_('start_pooling')}
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
