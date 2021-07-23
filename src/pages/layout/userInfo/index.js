'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import { Button, Popover, Modal, message } from 'antd';
import {
  UpOutlined,
  SwapOutlined,
  UserOutlined,
  LoadingOutlined,
  CloseOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import EventBus from 'common/eventBus';
import { strAbbreviation } from 'common/utils';
import Clipboard from 'components/clipboard';
import CustomIcon from 'components/icon';
import Lang from '../lang';
import styles from './index.less';
import _ from 'i18n';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
let _timer = 0;
let _notice = false;
@withRouter
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
      isLogin: false,
    };
    this.polling = true;
  }

  componentDidMount() {
    // if (!_notice) {
    //   _notice = true;
    //   Modal.info({
    //     title: _('notice'),
    //     content: (
    //       <div>
    //         <p>{_('notice720')}</p>
    //       </div>
    //     ),
    //     closable: true,
    //     footer: null,
    //   });
    // }
    this.fetchPairData();
    EventBus.on('login', this.chooseLoginWallet);
    const res = this.props.dispatch({
      type: 'user/loadingUserData',
      payload: {},
    });
    if (res.msg) {
      return message.error(res.msg);
    }
  }
  componentWillUnmount() {
    this.polling = false;
  }

  fetchPairData = async () => {
    const { currentPair, dispatch } = this.props;
    const _self = this;
    if (_timer < 1) {
      setTimeout(async () => {
        while (this.polling) {
          await sleep(30 * 1e3);
          const { dispatch, busy } = _self.props;
          if (busy) return;
          await dispatch({
            type: 'pair/updatePairData',
          });
          await dispatch({
            type: 'user/updateUserData',
          });
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
    // const res = await Volt.getWalletList();
    // console.log(res)
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

  connectWebWallet = async (type) => {
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
      },
    });

    console.log(con_res);
    if (con_res.msg) {
      return message.error(con_res.msg);
    }
    const res = await dispatch({
      type: 'user/loadingUserData',
      payload: {
        type,
      },
    });
    if (res.msg) {
      return message.error(res.msg);
    }
    EventBus.emit('reloadPair');
  };

  chooseLoginWallet = () => {
    this.setState({
      chooseLogin_visible: true,
      // pop_visible: false,
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

  // connectExtWallet = () => {
  //   console.log(window.bsv.a)
  // };

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
    const { userAddress, walletType } = this.props;
    return (
      <div className={styles.user_pop}>
        <div className={styles.app_title}>
          <Lang />
          {_('wallet_connected')}
          <CloseOutlined />
        </div>
        <div className={styles.hd}>
          <div className={styles.left}>
            <div className={styles.account_name}>
              <Clipboard
                text={userAddress}
                label={strAbbreviation(userAddress, [5, 4])}
                style={{ marginRight: 10 }}
              />
              {this.renderWalletIcon()}
            </div>
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
                this.props.history.push('/webwallet');
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
          style={{ fontSize: 30 }}
        />
      );
    }
  }

  render() {
    const { pop_visible, chooseLogin_visible } = this.state;
    const { userAddress, connecting, isLogin } = this.props;
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
            <div className={styles.account_trigger}>
              <span style={{ marginRight: 10 }}>
                {strAbbreviation(userAddress, [5, 4])}{' '}
              </span>
              {this.renderWalletIcon()}
            </div>
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
            title="connect to a wallet"
            visible={chooseLogin_visible}
            footer={null}
            className={styles.chooseLogin_dialog}
            width="400px"
            onCancel={this.closeChooseDialog}
          >
            <ul>
              <li onClick={() => this.connectWebWallet(2)}>
                Volt
                <CustomIcon type="iconicon-volt-tokenswap-circle" />
              </li>
              <li onClick={() => this.connectWebWallet(1)}>Web Wallet</li>
              {process.env.NODE_ENV === 'development' && (
                <li id="J_VoltExtConnectBtn" onClick={this.connectExtWallet}>
                  Chrome Ext
                </li>
              )}
            </ul>
          </Modal>
        )}
      </>
    );
  }
}
