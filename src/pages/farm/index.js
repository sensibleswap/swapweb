'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { jc } from 'common/utils';
import Pair from 'components/pair';
import Loading from 'components/loading';
import TokenLogo from 'components/tokenicon';
import CustomIcon from 'components/icon';
import Notice from 'components/notice';
import Header from '../layout/header';
import Lock from '../lock';
import styles from './index.less';
import _ from 'i18n';

@withRouter
@connect(({ user, pair, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...pair,
    loading:
      effects['pair/getAllPairs'] || effects['pair/getPairData'] || false,
  };
})
export default class Pool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app_pannel: false,
    };
  }

  showPannel = () => {
    this.setState({
      app_pannel: true,
    });
  };

  hidePannel = () => {
    this.setState({
      app_pannel: false,
    });
  };

  renderItem(data) {
    const { symbol1, symbol2 } = data;
    return (
      <div className={styles.item}>
        <div className={styles.item_title}>
          <div className={styles.icon}>
            <TokenLogo name={symbol1} size={20} />
            <TokenLogo
              name={symbol2}
              size={20}
              style={{ marginLeft: '-6px' }}
            />
          </div>
          <div className={styles.name}>
            {symbol1}/{symbol2}
          </div>
        </div>
        <div className={styles.item_desc}>
          {_('farm_item_desc', `${symbol1}/${symbol2}`)}
        </div>
        <div className={styles.item_data}>
          <div className={styles.item_data_left}>
            <div className={styles.label}>TVL</div>
            <div className={styles.value}>$100,000</div>
          </div>
          <div className={styles.item_data_right}>
            <Tooltip title={_('apy_info')}>
              <div className={styles.label} style={{ cursor: 'pointer' }}>
                APY
                <CustomIcon
                  type="iconi"
                  style={{
                    border: '1px solid #e8e8e8',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    fontSize: 15,
                    padding: 2,
                    width: 15,
                    textAlign: 'center',
                    marginLeft: 10,
                  }}
                />
              </div>
            </Tooltip>
            <div className={styles.value}>3, 000%</div>
          </div>
        </div>
        <div className={styles.item_action}>
          <div className={styles.item_action_data}>
            <div style={{ width: 78 }}>
              <div className={styles.label}>{_('depositors')}</div>
              <div className={styles.value}>200,000</div>
            </div>
            <div style={{ width: 78 }}>
              <div className={styles.label}>{_('crop')}:</div>
              <div className={styles.value}>0 {symbol1}</div>
            </div>
          </div>
          <Button type="primary" className={styles.btn}>
            {_('harvest')}
          </Button>
        </div>
      </div>
    );
  }

  renderContent() {
    return (
      <div className={styles.content}>
        <div className={styles.items}>
          {this.renderItem({
            symbol1: 'TSC',
            symbol2: 'USDT',
          })}
          {this.renderItem({
            symbol1: 'BSV',
            symbol2: 'USDT',
          })}
          {this.renderItem({
            symbol1: 'TSC',
            symbol2: 'USDT',
          })}
          {this.renderItem({
            symbol1: 'BSV',
            symbol2: 'USDT',
          })}
          {this.renderItem({
            symbol1: 'TSC',
            symbol2: 'USDT',
          })}
          {this.renderItem({
            symbol1: 'BSV',
            symbol2: 'USDT',
          })}
        </div>
      </div>
    );
  }

  render() {
    const { app_pannel } = this.state;
    const symbol1 = 'BSV';
    const symbol2 = 'USDT';

    return (
      <section className={styles.container}>
        <section
          className={
            app_pannel ? jc(styles.left, styles.app_hide) : styles.left
          }
        >
          <div className={styles.left_inner}>
            <Header />
            {this.renderContent()}
            <Button
              type="primary"
              className={styles.app_start_btn}
              onClick={this.showPannel}
            >
              {_('start_pooling')}
            </Button>
          </div>
        </section>
        <section className={styles.right}>
          <div
            className={
              app_pannel ? styles.sidebar : jc(styles.sidebar, styles.app_hide)
            }
          >
            <div className={styles.app_title}>
              {_('pool')}
              <div className={styles.close} onClick={this.hidePannel}>
                <CloseOutlined />
              </div>
            </div>

            <div className={styles.right_box}>
              <div className={styles.head}>
                <div className={styles.menu}>
                  <span
                    className={styles.menu_item}
                    key="deposit"
                    onClick={() => {
                      this.props.history.push('/pool/add');
                    }}
                  >
                    {_('deposit')}
                  </span>
                  <span
                    className={jc(styles.menu_item, styles.menu_item_selected)}
                    key="withdraw"
                  >
                    {_('withdraw')}
                  </span>
                </div>
              </div>
              <Lock />
            </div>
          </div>
        </section>
      </section>
    );
  }
}
