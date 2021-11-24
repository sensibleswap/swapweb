'use strict';
import React, { Component } from 'react';
import { Input, Form } from 'antd';
import { jc } from 'common/utils';
import TokenLogo from 'components/tokenicon';
import styles from './genesis.less';
import _ from 'i18n';

const FormItem = Form.Item;
const BSV = {
  symbol: 'BSV',
  name: 'Bitcoin SV',
};

export default class GenesisTokenInput extends Component {
  // constructor(props) {
  //     super(props);
  //     this.state = {
  //         token: props.initValue || undefined
  //     }
  // }

  changeValue = async (e, supportBsv) => {
    const { value } = e.target;
    const { dispatch, change } = this.props;
    let token = undefined;
    const isBsv = supportBsv && value.toUpperCase() === 'BSV';

    if (isBsv) {
      token = BSV;
    } else {
      const res = await dispatch({
        type: 'custom/query',
        payload: {
          genesisHash: value,
        },
      });

      if (e.target.value.toUpperCase() === 'BSV') return;
      if (res && !res.code) {
        token = res;
      }
    }
    // console.log(token)
    // this.setState({
    //     token
    // })
    change(token);
  };

  render() {
    // const { token } = this.state;
    const { title, name, supportBsv = false, token } = this.props;
    return (
      <div>
        <div className={styles.title}>{title}</div>
        <div
          className={
            token
              ? jc(styles.input_wrap, styles.input_result)
              : styles.input_wrap
          }
        >
          <FormItem name={name}>
            <Input.TextArea
              className={styles.input}
              onChange={(e) => this.changeValue(e, supportBsv)}
            />
          </FormItem>

          {token && (
            <div className={styles.token_info}>
              <TokenLogo
                name={token.symbol}
                genesisID={token.symbol === 'BSV' ? 'bsv' : token.genesis}
              />
              <div className={styles.token_name}>
                <div className={styles.symbol}>{token.symbol}</div>
                <div className={styles.full_name}>{token.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
