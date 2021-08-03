'use strict';
import React, { Component } from 'react';
import { Form, Button, Input, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import QRCode from 'qrcode.react';
import styles from './index.less';
import _ from 'i18n';
import BigNumber from 'bignumber.js';
import Clipboard from 'components/clipboard';
import debug from 'debug';
const log = debug('webwallet');

const FormItem = Form.Item;

@connect(({ user, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    // connecting: effects['user/loadingUserData'] || effects['user/connectWebWallet'],
  };
})
export default class WebWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
    };
    this.formRef = React.createRef();
  }
  back = () => {
    this.props.history.goBack();
  };
  login = async () => {
    const { dispatch } = this.props;
    await dispatch({
      type: 'user/connectWebWallet',
    });
    const res = await dispatch({
      type: 'user/loadingUserData',
      payload: {
        type: 1,
      },
    });
    if (res.msg) {
      return message.error(msg.error);
    }
  };
  handleSubmit = async (values) => {
    log(values);
    let { address, amount } = values;

    amount = BigNumber(amount).multipliedBy(1e8);
    const { dispatch } = this.props;
    const res = await dispatch({
      type: 'user/transferBsv',
      payload: {
        address,
        amount,
      },
    });
    //   console.log(ts_res);

    if (res.msg) {
      return message.error(res.msg);
    }
    message.success(_('withdraw_success'));
    dispatch({
      type: 'user/loadingUserData',
      payload: {
        type: 1,
      },
    });
  };
  setMaxAmount = () => {
    const { userBalance } = this.props;
    this.formRef.current.setFieldsValue({
      amount: userBalance.BSV,
    });
    this.setState({
      amount: userBalance.BSV,
    });
  };
  render() {
    const { userAddress, userBalance, isLogin } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.page_title}>
          <h1>{_('web_wallet')}</h1>
          <div className={styles.back} onClick={this.back}>
            <ArrowLeftOutlined /> {_('back_to_swap')}
          </div>
        </div>
        <div className={styles.tips}>{_('web_wallet_tips')}</div>
        <div className={styles.content}>
          <div className={styles.deposit}>
            <div className={styles.title}>{_('deposit_title')}</div>
            <div className={styles.qrcode}>
              <QRCode
                value={userAddress}
                style={{ width: '180px', height: '180px' }}
              />
            </div>
            <div className={styles.address}>
              <Clipboard text={userAddress} label={userAddress} />
            </div>
          </div>
          <div className={styles.withdraw}>
            <div className={styles.title}>
              <div>{_('withdraw_title')} BSV</div>
              <div className={styles.balance}>
                ({_('availabel')}:{' '}
                <span className={styles.blue}>{userBalance.BSV || 0}</span> BSV)
              </div>
            </div>
            <Form onFinish={this.handleSubmit} ref={this.formRef}>
              <FormItem name={'amount'} rules={[{ required: true }]}>
                <Input
                  className={styles.input}
                  addonBefore={`${_('amount')}:`}
                  addonAfter={
                    <span
                      onClick={this.setMaxAmount}
                      style={{ cursor: 'pointer' }}
                    >
                      {_('all_balance')}
                    </span>
                  }
                />
              </FormItem>
              <FormItem name={'address'} rules={[{ required: true }]}>
                <Input
                  className={styles.input}
                  addonBefore={`${_('address')}:`}
                />
              </FormItem>
              {isLogin ? (
                <Button type="primary" className={styles.btn} htmlType="submit">
                  {_('withdraw')}
                </Button>
              ) : (
                <Button
                  type="primary"
                  className={styles.btn}
                  onClick={this.login}
                >
                  {_('login')}
                </Button>
              )}
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
