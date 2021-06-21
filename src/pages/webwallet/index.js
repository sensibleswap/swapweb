'use strict';
import React, { Component } from 'react';
import { Form, Button, Input, Spin } from 'antd';
import { connect } from 'umi';
import QRCode from 'qrcode.react';
import styles from './index.less';
import _ from 'i18n';

const FormItem = Form.Item;

@connect(({ user, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    // connecting: effects['user/loadingUserData'] || effects['user/connectWebWallet'],
  };
})
export default class WebWallet extends Component {
  handleSubmit() {}
  render() {
    const { userAddress, userBalance, connecting } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.page_title}>
          <h1>{_('web_wallet')}</h1>
          <div className={styles.back} onClick={this.back}>
            {_('back_to_swap')}
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
          </div>
          <div className={styles.withdraw}>
            <div className={styles.title}>
              <div>{_('withdraw')} BSV</div>
              <div className={styles.balance}>
                ({_('availabel')}:{' '}
                <span className={styles.blue}>{userBalance.BSV}</span> BSV)
              </div>
            </div>
            <Form onSubmit={this.handleSubmit} ref={this.formRef}>
              <FormItem name={'amount'}>
                <Input
                  className={styles.input}
                  addonBefore={`${_('amount')}:`}
                  addonAfter={_('max')}
                />
              </FormItem>
              <FormItem name={'address'}>
                <Input
                  className={styles.input}
                  addonBefore={`${_('address')}/${_('paymail')}:`}
                />
              </FormItem>
              <Button type="primary" className={styles.btn}>
                {_('withdraw')}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
