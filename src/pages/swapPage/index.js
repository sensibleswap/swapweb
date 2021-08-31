'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { jc } from 'common/utils';
import Loading from 'components/loading';
import Notice from 'components/notice';
import Chart from 'components/chart';
import Header from '../layout/header';
import Swap from '../swap';
import PairStat from '../pairStat';
import styles from './index.less';
import _ from 'i18n';

@connect(({ pair, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    loading: effects['pair/getAllPairs'] || effects['pair/getPairData'],
  };
})
export default class SwapPage extends Component {
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
    const { loading, token1, token2, pairData } = this.props;
    if (loading || !token1.symbol) return <Loading />;
    // console.log(token2);
    return (
      <div className={styles.content}>
        <Chart />

        <h3 className={styles.title}>{_('pair_stat')}</h3>
        <PairStat pairData={{ ...pairData, token1, token2 }} />
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
                {_('start_swapping')}
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
                {_('swap')}
                <div className={styles.close} onClick={this.hidePannel}>
                  <CloseOutlined />
                </div>
              </div>
              <Swap />
            </div>
          </section>
        </section>
      </>
    );
  }
}
