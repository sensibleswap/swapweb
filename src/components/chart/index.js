'use strict';
import React, { Component } from 'react';
import 'whatwg-fetch';
import * as echarts from 'echarts';
import { connect } from 'umi';
import { Spin } from 'antd';
import EventBus from 'common/eventBus';
import { USDT_PAIR, COLOR1, COLOR2 } from 'common/const';
import styles from './index.less';
import _ from 'i18n';

@connect(({ pair, history, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    ...history,
    loading: effects['pair/getAllPairs'] || effects['history/query'],
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
      chartData: [],
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
            width: 1.5,
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
            width: 1.5,
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
    EventBus.on('reloadChart', (type) => this.handleData(type));
  }

  handleData = async (type) => {
    if (type !== this.props.type) return;
    const chartData = await this.getChartData(type);
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
  };

  async getChartData(type) {
    const { dispatch } = this.props;
    const res = await dispatch({
      type: 'history/query',
      payload: {
        type,
      },
    });

    if (res.msg) {
      message.error(res.msg);
      return [];
    }
    return res;
  }

  componentWillUnmount() {
    this.myChart.dispose();
  }

  render() {
    const { loading } = this.props;
    const { chartData } = this.state;
    return (
      <Spin spinning={chartData.length < 1 && loading}>
        <div id="J_Chart" className={styles.chart}></div>
      </Spin>
    );
  }
}
