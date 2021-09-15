'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import EventBus from 'common/eventBus';
import { Button, Dropdown, message, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { jc } from 'common/utils';
import { formatTime, formatAmount } from 'common/utils';
import { USDT_PAIR } from 'common/const';
import CustomIcon from 'components/icon';
import Loading from 'components/loading';
import Notice from 'components/notice';
import Chart from 'components/chart';
import TokenList from 'components/tokenList';
import Header from '../layout/header';
import Swap from '../swap';
import PairStat from '../pairStat';
import styles from './index.less';
import _ from 'i18n';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let _timer = 0;
@connect(({ pair, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    loading: effects['pair/getAllPairs'] || effects['pair/getPairData'],
    loadingChartData: effects['history/query'],
  };
})
export default class SwapPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app_pannel: false,
      chartData: [],
    };
    this.polling = true;
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

  componentWillUnmount() {
    this.polling = false;
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
    if (currentPair) {
      await dispatch({
        type: 'pair/getPairData',
        payload: {
          currentPair,
        },
      });
      const chartData = await this.getData();
      this.setState({
        chartData,
      });
      EventBus.emit('reloadChart', chartData);
      if (!_timer) {
        _timer = setTimeout(async () => {
          while (this.polling) {
            // console.log(i++)
            await sleep(60 * 1e3);

            const chartData = await this.getData();
            this.setState({
              chartData,
            });
            EventBus.emit('reloadChart', chartData);
          }
        });
      }
    }
  };

  async getData(currentPair) {
    const { allPairs, type } = this.props;
    if (!currentPair) {
      currentPair = this.props.currentPair;
    }
    if (!allPairs[currentPair]) return [];
    const { swapCodeHash, swapID, token2 } = allPairs[currentPair];

    const res = await this.props.dispatch({
      type: 'history/query',
      payload: {
        codeHash: swapCodeHash,
        genesisHash: swapID,
        type,
      },
    });

    if (res.code) {
      message.error(res.msg);
      return false;
    }

    let time = [],
      price = [],
      amount = [],
      volumn = [];
    if (res.length > 0) {
      if (type === 'pool') {
        res.forEach((item, index) => {
          const { outToken1Amount, timestamp } = item;
          amount.push(formatAmount((outToken1Amount / Math.pow(10, 8)) * 2, 8));
          time.push(formatTime(timestamp * 1000));
        });
      } else {
        res.forEach((item, index) => {
          const { minPrice, maxPrice, token1Volume, timestamp } = item;
          let _price =
            (minPrice + maxPrice) / 2 / Math.pow(10, 8 - token2.decimal);
          if (currentPair === USDT_PAIR) {
            _price = 1 / _price;
            price.push(formatAmount(_price, 6));
          } else {
            price.push(formatAmount(_price, 8));
          }

          volumn.push(formatAmount((token1Volume / Math.pow(10, 8)) * 2, 8));

          time.push(formatTime(timestamp * 1000));
        });
      }
    }

    return [price, amount, volumn, time];
  }

  changeTokenPair = async (currentPair) => {
    console.log('currentPair:', currentPair);
    const chartData = await this.getData(currentPair);
    this.setState({
      chartData,
    });
    EventBus.emit('reloadChart', chartData);
  };

  renderContent() {
    const { loading, token1, token2, pairData, loadingChartData } = this.props;
    if (loading || !token1.symbol) return <Loading />;
    const { chartData } = this.state;
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();

    return (
      <div className={styles.content}>
        <Dropdown
          overlay={<TokenList size="small" finish={this.changeTokenPair} />}
          overlayClassName={styles.drop_menu}
        >
          <span className={styles.chart_title}>
            {symbol2 === 'USDT' ? (
              <>
                <span>{symbol1}</span>/{symbol2}
              </>
            ) : (
              <>
                <span>{symbol2}</span>/{symbol1}
              </>
            )}
            <CustomIcon
              type="iconDropdown"
              style={{ fontSize: 20, marginLeft: 40 }}
            />
          </span>
        </Dropdown>
        <Chart type="swap" chartData={chartData} />

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
