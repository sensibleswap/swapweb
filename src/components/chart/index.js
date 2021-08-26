'use strict';
import React, { Component } from 'react';
import 'whatwg-fetch';
import * as echarts from 'echarts';
import { connect } from 'umi';
import { Spin, message } from 'antd';
import { formatTime, formatAmount } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';

const hashes = {
  'bsv-boex': {
    codeHash: 'c833f2ca7fae0be5d2b3e893794d5c81be017c66',
    genesisHash: '7286ee5b042662fb79b826e08e0f1398dd0b2a0d',
    decimal: 0,
  },
};

const record_num = [100, 500, 2000];
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

  async getData(index) {
    const size = record_num[index];
    if (!hashes[this.props.currentPair]) return [];
    const { codeHash, genesisHash, decimal } = hashes[this.props.currentPair];
    const res = await this.props.dispatch({
      type: 'history/query',
      payload: {
        codeHash,
        genesisHash,
        size,
        index,
      },
    });

    if (res.code) {
      message.error(res.msg);
      return false;
    }
    if (!res) {
      return false;
    }

    let time = [],
      price = [];
    res.forEach((item, index) => {
      const { outToken1Amount, outToken2Amount, timestamp } = item;
      price.push(
        formatAmount(
          outToken2Amount /
            Math.pow(10, decimal) /
            (outToken1Amount / Math.pow(10, 8)),
          decimal,
        ),
      );

      time.push(formatTime(timestamp * 1000));
    });

    return [price, time];
  }

  switch = async (index) => {
    const data = await this.getData(index);
    if (!data) return;

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
        {/*<div className={styles.trigger_wrap}>
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
      </>
    );
  }
}
