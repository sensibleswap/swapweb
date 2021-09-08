'use strict';
import React, { Component } from 'react';
import 'whatwg-fetch';
import * as echarts from 'echarts';
import { connect } from 'umi';
import { Spin, message, Dropdown, Menu } from 'antd';
import { formatTime, formatAmount } from 'common/utils';
import { TSWAP_CURRENT_PAIR } from 'common/const';
import CustomIcon from 'components/icon';
import TokenPair from 'components/tokenPair';
import styles from './index.less';
import _ from 'i18n';

const COLOR1 = '#2BB696';
const COLOR2 = '#BB6BD9';

@connect(({ pair, history, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    ...history,
    loading: effects['history/query'] || effects['pair/getAllPairs'],
  };
})
export default class Chart extends Component {
  constructor(props) {
    super(props);
    const { currentPair } = props;
    this.state = {
      chart_index: 0,
      cur_price: '',
      cur_amount: '',
    };
    this.option = {
      grid: {
        bottom: 30,
        left: 20,
        right: 20,
      },
      xAxis: {
        type: 'category',
        data: [],
        show: false,
      },
      yAxis: [
        {
          type: 'value',
          show: false,
        },
        {
          type: 'value',
          show: false,
        },
      ],
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          if (props.type === 'pool') {
            return `${_('date')}: ${params[0].name} <br />TVL: ${
              params[0].data
            } BSV<br />`;
          } else {
            return `${_('date')}: ${params[0].name} <br />${_('volume')}: ${
              params[1].data
            } BSV<br />${_('price')}: ${params[0].data} ${
              currentPair === 'bsv-usdt' ? 'USDT' : 'BSV'
            }`;
          }
        },
      },
      series: [
        {
          data: [],
          type: 'line',
          showSymbol: false,
          encode: {
            x: 'type',
            y: 'data',
            tooltip: ['Income'],
          },
          lineStyle: {
            color: COLOR1,
            width: 1,
          },
          yAxisIndex: 0,
        },
        {
          data: [],
          type: 'line',
          showSymbol: false,
          encode: {
            x: 'type',
            y: 'data',
            tooltip: ['Income'],
          },
          lineStyle: {
            color: COLOR2,
            width: 1,
          },
          yAxisIndex: 1,
        },
      ],
    };
  }

  componentDidMount() {
    this.init();
  }
  async init() {
    const chartDom = document.getElementById('J_Chart');
    this.myChart = echarts.init(chartDom);
    await this.switch(0);

    this.option && this.myChart.setOption(this.option);
  }

  switch = async () => {
    const data = await this.getData();
    if (!data) return;

    const [price, amount, volumn, time] = data;
    const { type } = this.props;
    this.option.xAxis.data = time;
    if (type === 'pool') {
      this.option.series[0].data = amount;
    } else {
      this.option.series[0].data = price;
      this.option.series[1].data = volumn;
    }

    this.myChart.setOption(this.option);
  };

  async getData() {
    const { currentPair, allPairs, type } = this.props;
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
          if (currentPair === 'bsv-usdt') {
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

  renderMenu = () => {
    const { allPairs, currentPair } = this.props;

    return (
      <Menu>
        {Object.keys(allPairs).map((item) => {
          const symbols = item.toUpperCase();
          const symbols_arr = symbols.split('-');
          return (
            <Menu.Item key={item}>
              <div
                className={styles.menu_item}
                onClick={() => this.selectToken(item)}
              >
                <TokenPair
                  symbol1={symbols_arr[0]}
                  symbol2={symbols_arr[1]}
                  size={25}
                />
                <span className={styles.menu_name}>{symbols}</span>
                <div>
                  {currentPair === item && (
                    <CustomIcon
                      type="icona-Group570"
                      style={{ fontSize: 20 }}
                    />
                  )}
                </div>
              </div>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  selectToken = (currentPair) => {
    if (currentPair === this.props.currentPair) return;
    window.localStorage.setItem(TSWAP_CURRENT_PAIR, currentPair);
    this.props.dispatch({
      type: 'pair/getPairData',
      payload: {
        currentPair,
      },
    });
  };

  componentWillUnmount() {
    this.myChart.dispose();
  }

  render() {
    const { token1, token2, type } = this.props;
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    const menu = this.renderMenu();
    return (
      <div className={styles.chart_container}>
        <Dropdown overlay={menu} overlayClassName={styles.drop_menu}>
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
        {type === 'swap' && (
          <div className={styles.data_info}>
            <div>
              <span
                className={styles.dot}
                style={{ backgroundColor: COLOR1 }}
              ></span>{' '}
              {_('price')}
            </div>
            <div>
              <span
                className={styles.dot}
                style={{ backgroundColor: COLOR2 }}
              ></span>{' '}
              {_('volume')}
            </div>
          </div>
        )}
        {type === 'pool' && (
          <div className={styles.data_info}>
            <div>
              <span
                className={styles.dot}
                style={{ backgroundColor: COLOR1 }}
              ></span>{' '}
              TVL
            </div>
          </div>
        )}

        <Spin spinning={this.props.loading}>
          <div id="J_Chart" className={styles.chart}></div>
        </Spin>
      </div>
    );
  }
}
