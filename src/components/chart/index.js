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

const record_num = [100, 500, 2000];

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
    this.state = {
      chart_index: 0,
      cur_price: '',
      cur_amount: '',
    };
    this.option = {
      xAxis: {
        type: 'category',
        data: [],
        show: false,
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          if (props.type === 'pool') {
            return `${_('date')}: ${params[0].name} <br />${_('amount')}: ${
              params[0].data
            } BSV<br />`;
          } else {
            return `${_('date')}: ${params[0].name} <br />${_('price')}: ${
              params[0].data
            } BSV<br />${_('amount')}: ${params[1].data} BSV`;
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
            color: '#2BB696',
            width: 3,
          },
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
            color: '#BB6BD9',
            width: 3,
          },
        },
      ],
    };
  }

  componentDidMount() {
    this.init();
  }
  async init() {
    // console.log(data);
    const chartDom = document.getElementById('J_Chart');
    this.myChart = echarts.init(chartDom);
    // const { brokenLine } = this.props.pair_data;
    // const xData = [];
    // const data = [];
    // brokenLine && Object.keys(brokenLine).forEach(item => {
    //     xData.push(brokenLine[item].time);
    //     data.push(brokenLine[item].amount);
    // })
    await this.switch(0);
    // option.xAxis.data = time;
    // option.series[0].data = price;
    this.option && this.myChart.setOption(this.option);
    const _self = this;
    this.myChart.on('mouseover', function (params) {
      console.log(params);
      _self.setState({
        cur_price: params.data,
        cur_amount: params.value,
      });
    });
  }
  componentWillUnmount() {
    this.myChart.dispose();
  }

  async getData(index) {
    const size = record_num[index];
    const { currentPair, allPairs, token2 } = this.props;
    const { swapCodeHash, swapID } = allPairs[currentPair];
    const { decimal } = token2;
    const res = await this.props.dispatch({
      type: 'history/query',
      payload: {
        codeHash: swapCodeHash,
        genesisHash: swapID,
        size,
        index,
      },
    });

    if (res.code) {
      message.error(res.msg);
      return false;
    }

    let time = [],
      price = [],
      amount = [];
    res.length > 0 &&
      res.forEach((item, index) => {
        const { outToken1Amount, outToken2Amount, timestamp } = item;
        price.push(
          formatAmount(
            outToken1Amount /
              Math.pow(10, 8) /
              (outToken2Amount / Math.pow(10, decimal)),
            8,
          ),
        );
        amount.push(formatAmount((outToken1Amount / Math.pow(10, 8)) * 2, 8));

        time.push(formatTime(timestamp * 1000));
      });

    return [price, amount, time];
  }

  switch = async (index) => {
    const data = await this.getData(index);
    if (!data) return;

    const [price, amount, time] = data;
    const { type } = this.props;
    this.option.xAxis.data = time;
    if (type === 'pool') {
      this.option.series[0].data = amount;
    } else {
      this.option.series[0].data = price;
      this.option.series[1].data = amount;
    }

    this.myChart.setOption(this.option);
    this.setState({
      chart_index: index,
    });
  };

  renderMenu = () => {
    const { allPairs, currentPair } = this.props;

    return (
      <Menu>
        {Object.keys(allPairs).map((item) => {
          const symbols = item.toUpperCase();
          const symbols_arr = symbols.split('-');
          return (
            <Menu.Item>
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

  render() {
    const { chart_index, cur_amount, cur_price } = this.state;
    const { token1, token2 } = this.props;
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();
    const menu = this.renderMenu();
    return (
      <div className={styles.chart_container}>
        <Dropdown overlay={menu} overlayClassName={styles.drop_menu}>
          <span className={styles.chart_title}>
            <span>{symbol2}</span>/{symbol1}
            <CustomIcon
              type="iconDropdown"
              style={{ fontSize: 20, marginLeft: 40 }}
            />
          </span>
        </Dropdown>
        <div className={styles.info}>
          <div>
            {_('price')}: {cur_price}
          </div>
        </div>
        {/*<div>
                    <div className={styles.trigger_wrap}>
                    {['1D', '1W', '1M'].map((item, index) => (
                        <span
                            onClick={() => this.switch(index)}
                            key={item}
                            className={
                                index === chart_index ? styles.current_trigger : styles.trigger
                            }
                        >
                            {item}
                        </span>
                    ))}
                        </div>*/}
        <Spin spinning={this.props.loading}>
          <div id="J_Chart" className={styles.chart}></div>
        </Spin>
        {/*</div>*/}
      </div>
    );
  }
}
