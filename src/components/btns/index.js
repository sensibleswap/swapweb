'use strict';
import EventBus from 'common/eventBus';
import { Button } from 'antd';
import { MINAMOUNT } from 'common/config';
import styles from './index.less';
import _ from 'i18n';

function login() {
  EventBus.emit('login');
}

const datas = {
  login: {
    txt: _('connect_wallet'),
    evt: login,
  },
  enterAmount: {
    txt: _('enter_amount'),
  },
  lowerAmount: {
    txt: _('lower_amount', MINAMOUNT),
  },
  lackBalance: {
    txt: function (symbol) {
      return symbol
        ? _('lac_token_balance', symbol.toUpperCase())
        : _('lac_balance');
    },
  },
};

export function BtnWait(conditions) {
  let result = false;
  for (let i = 0; i < conditions.length; i++) {
    let item = conditions[i];
    const { key, txtParam, cond } = item;
    if (key && datas[key]) {
      item = { ...datas[key], ...item };
    }
    let txt;
    if (key) {
      txt =
        typeof datas[key].txt === 'function'
          ? datas[key].txt(txtParam)
          : item.txt;
    }
    if (!txt && item.txt) {
      txt = item.txt;
    }

    if (cond) {
      result = (
        <Button className={styles.btn_wait} shape="round" onClick={item.evt}>
          {txt}
        </Button>
      );
      break;
    }
  }

  return result;
}
