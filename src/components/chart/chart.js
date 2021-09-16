'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import EventBus from 'common/eventBus';
import { Dropdown, message } from 'antd';
import { formatTime, formatAmount } from 'common/utils';
import { USDT_PAIR } from 'common/const';
import CustomIcon from 'components/icon';
import Loading from 'components/loading';
import Chart from 'components/chart';
import TokenList from 'components/tokenList';
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
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.polling = true;
  }

  componentWillUnmount() {
    this.polling = false;
  }

  componentDidMount() {
    this.init();
  }

  async init() {
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
      EventBus.emit('reloadChart', chartData);
      if (!_timer) {
        _timer = setTimeout(async () => {
          while (this.polling) {
            // console.log(i++)
            await sleep(60 * 1e3);

            const chartData = await this.getData();
            EventBus.emit('reloadChart', chartData);
          }
        });
      }
    }
  }

  async getData(currentPair) {
    if (!currentPair) {
      currentPair = this.props.currentPair;
    }

    const res = await this.props.dispatch({
      type: 'history/query',
      payload: {
        type,
        currentPair,
      },
    });

    if (res.code) {
      message.error(res.msg);
      return false;
    }
    return res;
  }

  changeTokenPair = async (currentPair) => {
    const chartData = await this.getData(currentPair);
    EventBus.emit('reloadChart', chartData);
  };

  render() {
    const { loading, token1, token2 } = this.props;
    if (loading || !token1.symbol) return <Loading />;
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    return (
      <div className={styles.container}>
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
        <Chart type="swap" />
      </div>
    );
  }
}
