'use strict';
import React, { Component } from 'react';
import { jc } from 'common/utils';
import CustomIcon from 'components/icon';
import styles from './index.less';
import _ from 'i18n';
import { withRouter, Link } from 'umi';

const menu = [
  {
    key: 'swap',
    label: _('swap'),
    path: 'swap',
  },
  {
    key: 'pool',
    label: _('pool'),
    path: 'pool/add',
  },
  {
    key: 'farm',
    label: _('farm'),
    path: 'farm',
  },
  // {
  //     key: 'explore',
  //     label: _('explore')
  // },
];
@withRouter
export default class Head extends Component {
  constructor(props) {
    super(props);
    const hash = window.location.hash.substr(2);
    let currentMenu = '';
    menu.forEach((item) => {
      if (hash.indexOf(item.key) > -1) {
        currentMenu = item.key;
      }
    });
    this.state = {
      currentMenu,
    };
  }

  gotoPage = (anchor) => {
    this.props.history.push(`/${anchor}`);
    // this.scrollto(anchor)
  };

  render() {
    const { currentMenu } = this.state;
    return (
      <div className={styles.nav_container}>
        <Link to="/" className={styles.logo}>
          <CustomIcon type="iconTS_logo" style={{ fontSize: 60 }} />
        </Link>
        <div className={styles.menu}>
          {menu.map((item) => {
            let cls = jc(styles.menu_item, styles[`menu_item_${item.key}`]);
            if (item.key === currentMenu) {
              cls = jc(
                styles.menu_item,
                styles.menu_item_selected,
                styles[`menu_item_${item.key}`],
              );
            }
            return (
              <span
                className={cls}
                onClick={() => this.gotoPage(item.path)}
                key={item.key}
              >
                {item.label}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
}
