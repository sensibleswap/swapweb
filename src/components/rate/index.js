'use strict';
import React, { Component } from 'react';
import BN from 'bignumber.js';
import { Input } from 'antd';
import EventBus from 'common/eventBus';
import FormatNumber from 'components/formatNumber';
import FarmPairIcon from 'components/pairIcon/farmIcon';
import Slider from './slider';
import styles from './index.less';
import _ from 'i18n';

export default class Rate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      amount: 0,
    };
  }

  componentDidMount() {
    EventBus.on('changeFarmPair', () => {
      this.setState({
        percent: 0,
        amount: 0,
      });
    });
  }

  countAmount(percent) {
    const { balance } = this.props;
    const amount = BN(balance).multipliedBy(percent).div(100).toString();
    return amount;
  }

  countPercent(amount) {
    const { balance } = this.props;
    const percent = BN(amount).div(balance).multipliedBy(100).toString();
    return percent;
  }

  change = ({ percent, amount }) => {
    const { balance } = this.props;

    if (percent >= 0) {
      amount = this.countAmount(percent);
    } else if (amount >= balance) {
      percent = 100;
      amount = balance;
    } else if (amount >= 0) {
      percent = this.countPercent(amount);
    }

    this.setState({
      percent,
      amount,
    });
    this.props.changeAmount(amount);
  };

  render() {
    const { percent, amount } = this.state;
    const { balance, tokenPair } = this.props;
    return (
      <div>
        <Slider
          percent={percent}
          changeRate={(value) => this.change({ percent: value })}
        />

        <div
          className={styles.balance}
          onClick={() => this.change({ percent: 100 })}
        >
          {_('balance')}:{' '}
          <span>
            <FormatNumber value={balance} />
          </span>
        </div>

        <div className={styles.pair_box}>
          <div className={styles.pair_left}>{tokenPair}</div>
          <div className={styles.pair_right}>
            <Input
              className={styles.input}
              value={amount}
              onChange={(e) => this.change({ amount: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }
}
