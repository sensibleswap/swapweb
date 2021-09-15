'use strict';
import React, { Component } from 'react';
import 'whatwg-fetch';
import * as echarts from 'echarts';
import { connect } from 'umi';
import { Spin } from 'antd';
import { USDT_PAIR } from 'common/const';
import styles from './index.less';
import _ from 'i18n';

const COLOR1 = '#2BB696';
const COLOR2 = '#BB6BD9';

@connect(({ pair, history, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    ...history,
    loading: effects['pair/getAllPairs'],
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
              currentPair === USDT_PAIR ? 'USDT' : 'BSV'
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
    this.polling = true;
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    const chartDom = document.getElementById('J_Chart');
    this.myChart = echarts.init(chartDom);
    this.handleData();
  }

  handleData() {
    const { chartData, type } = this.props;
    if (chartData.length > 1) {
      const [price, amount, volumn, time] = chartData;
      this.option.xAxis.data = time;
      if (type === 'pool') {
        this.option.series[0].data = amount;
      } else {
        this.option.series[0].data = price;
        this.option.series[1].data = volumn;
      }
    } else {
      this.option.series[0].data = [];
    }
    this.myChart.setOption(this.option);
    this.setState({
      chartData,
    });
  }

  componentWillUnmount() {
    this.myChart.dispose();
  }
  componentWillReceiveProps(nextProps) {
    const oldData = this.state.chartData;
    const newData = nextProps.chartData;
    console.log(nextProps.currentPair, this.props.currentPair);

    if (
      oldData.length !== newData.length ||
      oldData[0].length !== newData[0].length ||
      oldData[1].length !== newData[1].length ||
      oldData[2].length !== newData[2].length ||
      oldData[3].length !== newData[3].length
    ) {
      this.handleData();
    }
  }

  render() {
    const { type } = this.props;
    return (
      <div className={styles.chart_container}>
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

        <div id="J_Chart" className={styles.chart}></div>
      </div>
    );
  }
}
