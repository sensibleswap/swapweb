'use strict';
import React, { Component } from 'react';
import 'whatwg-fetch';
import * as echarts from 'echarts';
import { connect } from 'umi';
import { Spin } from 'antd';
import { formatTime, formatAmount } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';

const d = (60 / 10) * 24;
const record_num = [d, d * 7, d * 30];
let option;

option = {
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
      return 'Date: ' + params[0].name + '<br>Value: ' + params[0].data;
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
  ],
};

@connect(({ history, loading }) => {
  const { effects } = loading;
  return {
    ...history,
    loading: effects['history/query'],
  };
})
export default class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chart_index: 0,
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
    option && this.myChart.setOption(option);
  }

  timestamp(height) {
    const ts =
      3 * 3300 +
      1626957491 +
      ((height - 697021) * (1629015011 - 1626957491)) / (700436 - 697021.0);
    return ts;
  }

  async getData(index) {
    if (this.busy) return;
    this.busy = true;
    const num = record_num[index];
    const url = `https://api.sensible.satoplay.cn/contract/swap-data/863fb03584f1d140994856ef946b567dfaa73510/d5c8c7058119c0c6a20b3b4d542be41d3518b8fa?start=690000&size=${num}`;

    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log(data);
          let time = [],
            price = [];
          if (data.code) {
            message.error(data.msg);
          } else {
            const new_data = data.data.reverse();
            new_data.forEach((item, index) => {
              const { outToken1Amount, outToken2Amount, height } = item;
              price.push(
                formatAmount(
                  outToken1Amount / (outToken2Amount / 100000000),
                  8,
                ),
              );
              const ts = height === '4294967295' ? 0 : this.timestamp(height);

              time.push(formatTime(ts * 1000));
            });
          }
          this.busy = false;
          resolve([price, time]);
        });
    });
  }

  switch = async (index) => {
    const { codeHash, genesisHash, decimal } = this.props.token;
    debugger;
    const data = await this.getData(index);
    const [price, time] = data;
    option.xAxis.data = time;
    option.series[0].data = price;
    this.myChart.setOption(option);
    this.setState({
      chart_index: index,
    });
  };

  render() {
    const { chart_index } = this.state;
    return (
      <>
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
        </div>
        <Spin spinning={this.busy}>
          <div id="J_Chart" className={styles.chart}></div>
        </Spin>
      </>
    );
  }
}
