'use strict';
import EventBus from 'common/eventBus';
import { Button } from 'antd';
import styles from './index.less';
import _ from 'i18n';

function login() {
  EventBus.emit('login');
}

export function LoginBtn() {
  return (
    <Button className={styles.btn_wait} shape="round" onClick={login}>
      {_('connect_wallet')}
    </Button>
  );
}

export function EnterAmountBtn() {
  return (
    <Button className={styles.btn_wait} shape="round">
      {_('enter_amount')}
    </Button>
  );
}
