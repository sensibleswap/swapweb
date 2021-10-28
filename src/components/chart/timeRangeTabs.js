'use strict';
import React, { Component } from 'react';
import EventBus from 'common/eventBus';
import { connect } from 'umi';
import styles from './index.less';
import _ from 'i18n';

const timeRangeOptions = [
  // { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  // { label: 'ALL', value: 'all' },
];

@connect(({ records }) => {
  return {
    ...records,
  };
})
export default class TimeRangeTabs extends Component {
  async changeTimeRange(timeRange) {
    const { dispatch, type } = this.props;
    await dispatch({
      type: 'records/save',
      payload: {
        timeRange,
      },
    });
    EventBus.emit('reloadChart', type);
  }

  render() {
    const { timeRange } = this.props;

    return (
      <div className={styles.time_range_picker}>
        {timeRangeOptions.map(({ label, value }) => (
          <div
            key={value}
            className={timeRange === value ? styles.active : ''}
            onClick={() => this.changeTimeRange(value)}
          >
            {label}
          </div>
        ))}
      </div>
    );
  }
}
