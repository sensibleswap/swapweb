'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { jc, formatSat } from 'common/utils';
import EventBus from 'common/eventBus';
import TokenLogo from 'components/tokenicon';
import CustomIcon from 'components/icon';
import Header from '../layout/header';
import Deposit from '../deposit';
import Withdraw from '../withdraw';
import debug from 'debug';
import styles from './index.less';
import _ from 'i18n';
const log = debug('farm');

const TSC = 'TSC';
@withRouter
@connect(({ user, farm, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...farm,
    loading:
      effects['farm/getAllPairs'] || effects['farm/getPairData'] || false,
  };
})
export default class FarmC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app_pannel: false,
      current_item: 0,
      currentMenuIndex: 0,
    };
  }

  componentDidMount() {
    EventBus.on('reloadPair', this.fetch);
    this.fetch();
  }

  fetch = async () => {
    const { dispatch, userAddress } = this.props;
    await dispatch({
      type: 'farm/getAllPairs',
      payload: {
        address: userAddress,
      },
    });

    // let { currentPair } = this.props;
    // log('currentPair:', currentPair);
    // if (currentPair) {
    //   await dispatch({
    //     type: 'farm/getPairData',
    //     payload: {
    //       currentPair,
    //     },
    //   });
    // }
  };

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

  renderItem(pairName, data, index) {
    pairName = pairName.toUpperCase();
    const { symbol1, symbol2 } = this.props;
    const { poolTokenAmount, rewardTokenAmount = 0, addressCount } = data;
    const { current_item } = this.state;
    return (
      <div
        className={
          current_item === index ? jc(styles.item, styles.current) : styles.item
        }
        key={pairName}
      >
        <div className={styles.item_title}>
          <div className={styles.icon}>
            <TokenLogo name={symbol2} size={20} />
            <TokenLogo
              name={symbol1}
              size={20}
              style={{ marginLeft: '-6px' }}
            />
          </div>
          <div className={styles.name}>
            {symbol2}/{symbol1}
          </div>
        </div>
        <div className={styles.item_desc}>
          {_('farm_item_desc', `${pairName}`)}
        </div>
        <div className={styles.item_data}>
          <div className={styles.item_data_left}>
            <div className={styles.label}>TVL</div>
            <div className={styles.value}>{poolTokenAmount}*lp price</div>
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
              <div className={styles.value}>{addressCount}</div>
            </div>
            <div style={{ width: 78 }}>
              <div className={styles.label}>{_('crop')}:</div>
              <div className={styles.value}>
                {formatSat(rewardTokenAmount)} {TSC}
              </div>
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
    const { allPairs } = this.props;
    return (
      <div className={styles.content}>
        <div className={styles.items}>
          {Object.keys(allPairs).map((item, index) => {
            return this.renderItem(item, allPairs[item], index);
          })}
        </div>
      </div>
    );
  }

  render() {
    const { app_pannel, currentMenuIndex } = this.state;

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
              {_('start_deposit')}
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
                  {['deposit', 'withdraw'].map((item, index) => (
                    <span
                      className={
                        index === currentMenuIndex
                          ? jc(styles.menu_item, styles.menu_item_selected)
                          : styles.menu_item
                      }
                      key={item}
                      onClick={() => {
                        this.setState({
                          currentMenuIndex: index,
                        });
                      }}
                    >
                      {_(item)}
                    </span>
                  ))}
                </div>
              </div>
              {currentMenuIndex === 0 && <Deposit />}
              {currentMenuIndex === 1 && <Withdraw />}
            </div>
          </div>
        </section>
      </section>
    );
  }
}
