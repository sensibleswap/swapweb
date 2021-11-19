'use strict';
import React, { Component } from 'react';
import { history, connect } from 'umi';
import { Popover, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import EventBus from 'common/eventBus';
import CustomIcon from 'components/icon';
import { sleep } from 'common/utils';
import Wallet from '@/lib/main';
import Popup from './popup';
import ChooseWallet from './chooseWallet';
import styles from './index.less';
import _ from 'i18n';

let _timer = 0;

@connect(({ pair, user, loading }) => {
  const effects = loading.effects;
  return {
    ...pair,
    ...user,
    connecting:
      effects['user/loadingUserData'] || effects['user/connectWebWallet'],
    busy: effects['pair/getPairData'] || effects['pair/updatePairData'],
  };
})
export default class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pop_visible: false,
      chooseLogin_visible: false,
    };
    this.polling = true;
  }

  componentDidMount() {
    this.initWallet();
    this.fetchPairData();
    EventBus.on('login', this.chooseLoginWallet);
  }
  componentWillUnmount() {
    this.polling = false;
  }

  initWallet = () => {
    const _wallet = Wallet({ type: 2 });

    _wallet.bsv.on('accountChanged', async (depositAddress) => {
      const { dispatch, isLogin } = this.props;

      if (depositAddress && !isLogin) {
        await dispatch({
          type: 'user/loadingUserData',
          payload: {
            type: 2,
          },
        });
        if (window.location.hash.indexOf('farm') > -1) {
          history.push('/farm');
          EventBus.emit('reloadPair');
        }
      }
    });
    _wallet.bsv.on('close', () => {
      this.props.dispatch({
        type: 'user/save',
        payload: {
          accountInfo: {
            userBalance: {},
          },
          isLogin: false,
        },
      });
      if (window.location.hash.indexOf('farm') > -1) {
        EventBus.emit('reloadPair');
      }
    });
  };

  fetchPairData = async () => {
    const _self = this;
    let i = 0;
    if (_timer < 1) {
      setTimeout(async () => {
        while (this.polling) {
          const { dispatch, busy, isLogin, accountInfo } = _self.props;
          dispatch({
            type: 'pair/getUSDPrice',
          });
          await sleep(20 * 1e3);
          i++;
          const { hash } = window.location;
          if (busy) return;
          if (hash.indexOf('farm') < 0) {
            dispatch({
              type: 'pair/updatePairData',
            });
          }

          if (hash.indexOf('farm') > -1) {
            dispatch({
              type: 'farm/updatePairData',
              payload: {
                address: accountInfo.userAddress,
              },
            });
          }
          if (isLogin) {
            await dispatch({
              type: 'user/updateUserData',
            });
          }

          if (i > 1) {
            i = 0;
            const { hash } = location;
            if (hash.indexOf('swap') > -1) {
              EventBus.emit('reloadChart', 'swap');
            } else if (hash.indexOf('pool') > -1) {
              EventBus.emit('reloadChart', 'pool');
            }
          }
        }
      });
    }
  };

  handleVisibleChange = (visible) => {
    this.setState({ pop_visible: visible });
  };

  connectWebWallet = async (type, network) => {
    if (this.busy) return;
    this.busy = true;
    this.closeChooseDialog();
    const { dispatch } = this.props;

    const con_res = await dispatch({
      type: 'user/connectWebWallet',
      payload: {
        type,
        network,
      },
    });
    // console.log(con_res);
    if (con_res.msg) {
      this.busy = false;
      return message.error(con_res.msg);
    }
    const res = await dispatch({
      type: 'user/loadingUserData',
      payload: {
        type,
      },
    });
    if (res.msg) {
      this.busy = false;
      return message.error(res.msg);
    }
    this.busy = false;

    EventBus.emit('reloadPair');
  };

  chooseLoginWallet = () => {
    this.setState({
      chooseLogin_visible: true,
    });
    if (this.state.pop_visible) {
      this.setState({
        pop_visible: false,
      });
    }
  };

  closeChooseDialog = () => {
    this.setState({
      chooseLogin_visible: false,
    });
  };

  renderWalletIcon() {
    const { walletType } = this.props;
    if (walletType === 1) {
      return <span className={styles.dot}></span>;
    } else if (walletType === 2) {
      return <CustomIcon type="iconicon-volt-tokenswap-circle" />;
    }
  }

  renderAppConnectBtn() {
    const { connecting, isLogin } = this.props;
    return (
      <div
        className={styles.connect_app}
        onClick={connecting || isLogin ? null : this.chooseLoginWallet}
      >
        {connecting ? <LoadingOutlined /> : <CustomIcon type="iconicon-me" />}
      </div>
    );
  }

  renderConnectBtn() {
    const { connecting, isLogin } = this.props;
    return (
      <div
        className={styles.connect}
        onClick={connecting || isLogin ? null : this.chooseLoginWallet}
      >
        {connecting ? <LoadingOutlined /> : _('connect_wallet')}
      </div>
    );
  }

  renderConnectedBtn() {
    const { accountInfo } = this.props;
    const { pop_visible } = this.state;
    return (
      <div className={styles.account_trigger}>
        {this.renderWalletIcon()}
        <span className={styles.address}>{accountInfo.userAddressShort}</span>
        <CustomIcon
          type="iconDropdown"
          style={{
            fontSize: 16,
            marginLeft: 'auto',
            marginRight: 0,
            transition: 'transform 0.2s ease',
            transform: `rotate(${pop_visible ? 180 : 0}deg)`,
          }}
        />
      </div>
    );
  }

  disConnect = async () => {
    this.props.dispatch({
      type: 'user/disconnectWebWallet',
    });
  };

  render() {
    const { pop_visible, chooseLogin_visible } = this.state;
    const { walletType, accountInfo, isLogin } = this.props;

    return (
      <>
        {isLogin ? (
          <Popover
            content={
              <Popup
                walletType={walletType}
                accountInfo={accountInfo}
                close={this.handleVisibleChange}
                chooseLoginWallet={this.chooseLoginWallet}
                disConnect={this.disConnect}
              />
            }
            trigger="click"
            visible={pop_visible}
            onVisibleChange={this.handleVisibleChange}
            overlayClassName={styles.popover}
            placement="bottom"
          >
            {this.renderConnectedBtn()}
            {this.renderAppConnectBtn()}
          </Popover>
        ) : (
          <>
            {this.renderConnectBtn()}
            {this.renderAppConnectBtn()}
          </>
        )}

        {chooseLogin_visible && (
          <ChooseWallet
            closeChooseDialog={this.closeChooseDialog}
            connectWebWallet={this.connectWebWallet}
          />
        )}
      </>
    );
  }
}
