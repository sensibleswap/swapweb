'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import { Button, Popover, Modal } from 'antd';
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
import Lang from '../lang';
import styles from './index.less';
import _ from 'i18n';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

@withRouter
@connect(({ pair, user, loading }) => {
  const effects = loading.effects;
  return {
    ...pair,
    ...user,
    connecting:
      effects['user/loadingUserData'] || effects['user/connectWebWallet'],
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
  }

  componentDidMount() {
    this.fetchPairData();
    EventBus.on('login', this.chooseLoginWallet);
    const res = this.props.dispatch({
      type: 'user/loadingUserData',
    });
    if (res.msg) {
      return message.error(res.msg);
    }
  }

  fetchPairData = async () => {
    const { currentPair, dispatch } = this.props;

    setTimeout(async () => {
      do {
        await sleep(30 * 1e3);
        if (!currentPair) return;
        await dispatch({
          type: 'pair/updatePairData',
          payload: {
            currentPair,
          },
        });
        await dispatch({
          type: 'user/updateUserData',
        });
      } while (true);
    });
  };

  init = async () => {
    // const res = await Volt.isOnline();
    // debugger
    //   if (res) {
    //     const res = await Volt.getWalletById();
    //     // console.log(res);
    //     if (res.code !== 200) return;
    //     const wallet = res.data;
    //     await this.props.dispatch({
    //       type: 'user/saveWalletData',
    //       payload: {
    //         isLogin: true,
    //         accountName: wallet.paymail || wallet.name,
    //         wallet: wallet,
    //       },
    //     });
    //   }
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
  // login = async () => {
  //     const res = await Volt.login();
  //     if (res) {
  //         const res = await Volt.getWalletDetail();
  //         // console.log(res);
  //         if (res.code !== 200) return;
  //         const wallet = res.data;
  //         await this.props.dispatch({
  //             type: 'user/saveWalletData',
  //             payload: {
  //                 isLogin: true,
  //                 accountName: wallet.paymail || wallet.name,
  //                 wallet: wallet,
  //             },
  //         });
  //     }
  // }

  connectWebWallet = async () => {
    this.closeChooseDialog();
    const { isLogin, dispatch } = this.props;

    if (isLogin) {
      await dispatch({
        type: 'user/disconnectWebWallet',
      });
    }

    await dispatch({
      type: 'user/connectWebWallet',
    });
    const res = await dispatch({
      type: 'user/loadingUserData',
    });
    if (res.msg) {
      return message.error(msg.error);
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

  connectExtWallet = () => {
    window.postMessage({ type: 'MsgFromPage', msg: 'Hello, I am page.' }, '*');
    var targetExtensionId = 'lcfbfbjeehjallkfjmmlobmmnjeeomdg'; // 插件的ID
    chrome.runtime.sendMessage(
      targetExtensionId,
      { type: 'MsgFromPage', msg: 'Hello, I am page~' },
      function (response) {
        console.log(response);
      },
    );
  };

  // 打开登录对话框
  // login1 = () => {
  //     this.setState({
  //         login_visible: true,
  //         pop_visible: false,
  //         dialog_visible: false
  //     });
  //     const { isLogin } = this.props;

  //     _loginTimer = setInterval(async () => {

  //         const res = await Volt.isOnline();
  //         console.log(res);

  //         if (isLogin || !this.state.login_visible) {
  //             clearInterval(_loginTimer);
  //         }
  //         // 登录成功后
  //         if (res.data.wid) {

  //             this.setState({
  //                 login_visible: false,
  //             })
  //             await this.props.dispatch({
  //                 type: 'user/getWalletById',
  //                 payload: {
  //                     wid: res.wid
  //                 }
  //             })

  //             clearInterval(_loginTimer);
  //         }
  //         // }
  //     }, 500);
  // }

  // closeLogin = () => {

  //     this.setState({
  //         login_visible: false,
  //     });
  //     clearInterval(_loginTimer);
  // }

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
    const { userAddress } = this.props;
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
              />
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
          {/*<div className={styles.line} onClick={() => {
                    this.props.history.push('my');
                    this.closePop()
                }}>
                    <UserOutlined style={{ fontSize: 18, color: '#2F80ED', marginRight: 15 }} />
                    <span className={styles.name}>{_('go_to_infopage')}</span>
            </div>*/}
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
              {strAbbreviation(userAddress, [5, 4])}{' '}
              <span className={styles.dot}></span>
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
              <li onClick={this.connectWebWallet}>Web Wallet</li>
              <li id="connect_volt_ext">Volt Chrome Ext</li>
            </ul>
          </Modal>
        )}
      </>
    );
  }
}
