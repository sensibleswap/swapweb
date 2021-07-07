'use strict';
import React, { Component } from 'react';
import { Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from './index.less';
import _ from 'i18n';
import { slippage_data } from 'common/config';

const { localStorage } = window;

const {
  slippage_tolerance_index,
  slippage_tolerance_value,
  defaultIndex,
  datas,
} = slippage_data;

export default class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: defaultIndex,
      currentValue: datas[2],
    };
  }

  componentDidMount() {
    let i = localStorage.getItem(slippage_tolerance_index);
    let v = localStorage.getItem(slippage_tolerance_value);
    if (typeof i === 'undefined' || i === null) {
      localStorage.setItem(slippage_tolerance_index, defaultIndex);
      localStorage.setItem(slippage_tolerance_value, datas[defaultIndex]);
    } else {
      this.setState({
        currentIndex: i,
      });
      if (i > 1) {
        this.setState({
          currentValue: v,
        });
      }
    }
  }

  switch = (index) => {
    this.setState({
      currentIndex: index,
    });
    localStorage.setItem(slippage_tolerance_index, index);
    localStorage.setItem(
      slippage_tolerance_value,
      index > 1 ? this.state.currentValue : datas[index],
    );
    if (index < 2) {
      this.props.close();
    }
  };

  reset = () => {
    this.setState({
      currentIndex: defaultIndex,
    });
    localStorage.setItem(slippage_tolerance_index, defaultIndex);
    localStorage.setItem(slippage_tolerance_value, datas[defaultIndex]);
  };

  changeTol = (e) => {
    const value = e.target.value;
    this.setState({
      currentIndex: 2,
      currentValue: value,
    });
    localStorage.setItem(slippage_tolerance_index, 2);
    localStorage.setItem(slippage_tolerance_value, value);
  };

  render() {
    const { currentIndex, currentValue } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.back}>
            <ArrowLeftOutlined
              onClick={this.props.close}
              style={{ fontSize: 16, color: '#2F80ED', fontWeight: 700 }}
            />
          </div>
          <div className={styles.title}>{_('tx_settings')}</div>
          <div className={styles.done} onClick={this.props.close}>
            {_('done')}
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.hd}>
            <div className={styles.title}>{_('slippage_tolerance')}</div>
            <div className={styles.reset} onClick={this.reset}>
              {_('reset')}
            </div>
          </div>
          <div className={styles.desc}>{_('tolerance_desc')}</div>
          <div className={styles.items}>
            {datas.map((item, index) => {
              if (index < 2)
                return (
                  <div
                    className={
                      index === parseInt(currentIndex)
                        ? styles.current_item
                        : styles.item
                    }
                    key={item}
                    onClick={() => this.switch(index)}
                  >
                    {item}%
                  </div>
                );
            })}
            <Input
              value={currentValue}
              className={
                2 === parseInt(currentIndex)
                  ? styles.current_item_input
                  : styles.item_input
              }
              onClick={() => this.switch(2)}
              onChange={this.changeTol}
            />{' '}
            %
          </div>
        </div>
      </div>
    );
  }
}
