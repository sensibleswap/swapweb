'use strict';
import React, { Component } from 'react';
import { history, connect } from 'umi';
import querystring from 'querystringify';
import { Button, Popover, Modal, message, Tooltip } from 'antd';
import {
  UpOutlined,
  SwapOutlined,
  UserOutlined,
  LoadingOutlined,
  CloseOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import QRCode from 'qrcode.react';
import EventBus from 'common/eventBus';
import Clipboard from 'components/clipboard';
import CustomIcon from 'components/icon';
import { sleep } from 'common/utils';
import Lang from '../lang';
import styles from './index.less';
import _ from 'i18n';
import { isMobile } from 'react-device-detect';

const query = querystring.parse(window.location.search);
const isApp = query.env === 'webview' && window._volt_javascript_bridge;

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
      dialog_visible: false,
      login_visible: false,
      chooseLogin_visible: false,
      select_account_index: '',
      wallet_list: [],
    };
    this.polling = true;
  }

  componentDidMount() {
    this.fetchPairData();
    EventBus.on('login', this.chooseLoginWallet);
  }
  componentWillUnmount() {
    this.polling = false;
  }

  fetchPairData = async () => {
    const _self = this;
    let i = 0;
    if (_timer < 1) {
      setTimeout(async () => {
        while (this.polling) {
          await sleep(20 * 1e3);
          i++;
          const { dispatch, busy, isLogin, userAddress } = _self.props;
          if (busy) return;
          dispatch({
            type: 'pair/updatePairData',
          });

          dispatch({
            type: 'farm/updatePairData',
            payload: {
              address: userAddress,
            },
          });

          if (isLogin) {
            const res = await dispatch({
              type: 'user/updateUserData',
            });
            if (res.msg && res.msg.indexOf('not_login') > -1) {
              this.disConnect();
            }
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

  closePop = () => {
    this.setState({
      pop_visible: false,
    });
  };

  // 打开切换钱包的对话框
  showDialog = async () => {
    this.setState({
      pop_visible: false,
      dialog_visible: true,
      walletList_loading: true,
    });
    const res = await this.props.dispatch({
      type: 'user/getWalletList',
    });
    const { wid } = this.props;

    if (!Array.isArray(res)) return;
    const list = res.filter((v) => v.tokenid === 1);
    let current_index = list.findIndex((v) => parseInt(v.id) === parseInt(wid));
    if (current_index < 0) current_index = 0;
    this.setState({
      walletList_loading: false,
      wallet_list: list,
      select_account_index: current_index,
    });
  };
  // 关闭切换钱包的对话框
  closeDialog = () => {
    this.setState({
      dialog_visible: false,
    });
  };

  handleVisibleChange = (visible) => {
    this.setState({ pop_visible: visible });
  };

  connectWebWallet = async (type, network) => {
    if (this.busy) return;
    this.busy = true;
    this.closeChooseDialog();
    const { isLogin, dispatch } = this.props;

    if (isLogin) {
      await dispatch({
        type: 'user/disconnectWebWallet',
      });
    }

    const con_res = await dispatch({
      type: 'user/connectWebWallet',
      payload: {
        type,
        network,
      },
    });

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

  disConnect = async () => {
    this.props.dispatch({
      type: 'user/disconnectWebWallet',
    });
  };

  confirmSwitchWallet = () => {
    const { select_account_index, wallet_list } = this.state;
    const wallet = wallet_list[select_account_index];

    this.props.dispatch({
      type: 'user/switchWallet',
      payload: {
        wid: wallet.id,
      },
    });
    this.setState({
      dialog_visible: false,
    });
  };

  switchAccountName = (index) => {
    this.setState({
      select_account_index: index,
    });
  };

  renderPop() {
    const { userAddress, userAddressShort, walletType } = this.props;
    return (
      <div className={styles.user_pop}>
        <div className={styles.app_title} onClick={this.closePop}>
          <Lang />
          {_('wallet_connected')}
          <CloseOutlined />
        </div>
        <div className={styles.hd}>
          <div className={styles.left}>
            <Tooltip
              overlayClassName={styles.address_qrcode}
              title={
                <div style={{ backgroundColor: '#fff', padding: 5 }}>
                  <QRCode
                    value={userAddress}
                    style={{ width: '145px', height: '145px' }}
                  />
                </div>
              }
              placement="bottomRight"
              trigger="hover"
            >
              <div className={styles.account_name}>
                <div className={styles.qr_icon}>
                  <img src="assets/qr1.png" style={{ width: 22, height: 22 }} />
                </div>
                <Clipboard text={userAddress} label={userAddressShort} />
                {this.renderWalletIcon()}
              </div>
            </Tooltip>
          </div>
          <div className={styles.account_icon} onClick={this.closePop}>
            <UpOutlined />
          </div>
        </div>
        <div className={styles.bd}>
          <div className={styles.line} onClick={this.chooseLoginWallet}>
            <SwapOutlined
              style={{ fontSize: 18, color: '#2F80ED', marginRight: 15 }}
            />
            <span className={styles.name}>{_('switch_wallet')}</span>
          </div>
          {walletType === 1 && (
            <div
              className={styles.line}
              onClick={() => {
                history.push('/webwallet');
                this.closePop();
              }}
            >
              <DollarOutlined
                style={{ fontSize: 18, color: '#2F80ED', marginRight: 15 }}
              />
              <span className={styles.name}>{_('withdraw')}</span>
            </div>
          )}
        </div>
        <div className={styles.ft}>
          <Button
            className={styles.btn}
            shape="round"
            style={{ width: '100%' }}
            onClick={this.disConnect}
          >
            {_('disconnect_account')}
          </Button>
        </div>
      </div>
    );
  }
  renderWalletIcon() {
    const { walletType } = this.props;
    if (walletType === 1) {
      return <span className={styles.dot} style={{ marginRight: 5 }}></span>;
    } else if (walletType === 2) {
      return (
        <CustomIcon
          type="iconicon-volt-tokenswap-circle"
          style={{ fontSize: 30, marginLeft: 10 }}
        />
      );
    }
  }

  render() {
    const { pop_visible, chooseLogin_visible } = this.state;
    const { userAddressShort, userAddress, connecting, isLogin } = this.props;

    return (
      <>
        {isLogin ? (
          <Popover
            content={this.renderPop()}
            trigger="click"
            visible={pop_visible}
            onVisibleChange={this.handleVisibleChange}
            placement="bottomRight"
          >
            {!isMobile ? (
              <div className={styles.account_trigger}>
                <span style={{ marginLeft: 5 }}>{userAddressShort} </span>
                {this.renderWalletIcon()}
              </div>
            ) : (
              <div className={styles.connect_app}>
                <UserOutlined />
              </div>
            )}
          </Popover>
        ) : (
          <>
            {connecting ? (
              <div className={styles.connect}>
                <LoadingOutlined />
              </div>
            ) : (
              <div className={styles.connect} onClick={this.chooseLoginWallet}>
                {_('connect_wallet')}
              </div>
            )}

            {connecting ? (
              <div className={styles.connect_app}>
                <LoadingOutlined />
              </div>
            ) : (
              <div
                className={styles.connect_app}
                onClick={this.chooseLoginWallet}
              >
                <UserOutlined />
              </div>
            )}
          </>
        )}

        {chooseLogin_visible && (
          <Modal
            title=""
            visible={chooseLogin_visible}
            footer={null}
            className={styles.chooseLogin_dialog}
            width="400px"
            onCancel={this.closeChooseDialog}
            closable={false}
          >
            <div className={styles.title}>{_('connect_wallet')}</div>
            <ul>
              <li
                onClick={() => this.connectWebWallet(isApp ? 3 : 2, 'mainnet')}
              >
                <CustomIcon
                  type="iconicon-volt-tokenswap-circle"
                  style={{ fontSize: 30 }}
                />
                <div className={styles.label}>Volt {_('wallet')}</div>
              </li>

              {query.env === 'local' && (
                <li
                  onClick={() =>
                    this.connectWebWallet(isApp ? 3 : 2, 'testnet')
                  }
                >
                  <CustomIcon type="iconBSVtestnet" style={{ fontSize: 30 }} />
                  <div className={styles.label}>BSV Testnet</div>
                </li>
              )}
              {!isApp && (
                <li
                  onClick={() => this.connectWebWallet(1)}
                  style={{ fontSize: 15 }}
                >
                  <div className={styles.ts_icon}>
                    <CustomIcon type="iconTS_Logo" style={{ fontSize: 20 }} />
                  </div>
                  <div className={styles.label}>
                    TS {_('wallet')}
                    <div className={styles.sub}>{_('test_only')}</div>
                  </div>
                </li>
              )}
              {/*process.env.NODE_ENV === 'development' && (
                <li id="J_VoltExtConnectBtn" onClick={this.connectExtWallet}>
                  Chrome Ext
                </li>
              )*/}
            </ul>
          </Modal>
        )}
      </>
    );
  }
}
