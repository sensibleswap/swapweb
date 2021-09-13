'use strict';
import React, { Component } from 'react';
import Clipboard from 'react-clipboard.js';
import { message } from 'antd';
import CustomIcon from 'components/icon';
import _ from 'i18n';
import styles from './index.less';

export default class CustomClipboard extends Component {
  onCopySuccess() {
    message.success(_('copied'));
  }

  render() {
    const { label, style } = this.props;
    const _label = label ? label : <CustomIcon type="iconcopy" />;
    return (
      <Clipboard
        component="span"
        onSuccess={::this.onCopySuccess}
        data-clipboard-text={this.props.text}
        className={styles.clipboard}
        style={style}
      >
        {_label}
      </Clipboard>
    );
  }
}
