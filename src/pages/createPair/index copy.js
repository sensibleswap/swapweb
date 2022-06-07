'use strict';
import React, { Component } from 'react';
import { gzip } from 'node-gzip';
import { history, connect } from 'umi';
import { Steps, Button, Input, message, Form, Spin } from 'antd';
import TokenLogo from 'components/tokenicon';
import Loading from 'components/loading';
import PoolMenu from 'components/poolMenu';
import { jc, isTestNet } from 'common/utils';
import EventBus from 'common/eventBus';
import Pool from '../pool';
import styles from './index.less';
import _ from 'i18n';
import { BtnWait } from 'components/btns';
import { SuccessResult } from 'components/result';
import { Plus } from 'components/ui';

const { Step } = Steps;
const FormItem = Form.Item;
const stepData = [_('select_pair'), _('pay_fee'), _('finish')];
const bsvtsc = 'bsv-tsc';
const bsvtest = 'tbsv-test';

@connect(({ custom, user, pair, loading }) => {
  const { effects } = loading;
  return {
    ...user,
    ...pair,
    loading: effects['pair/getAllPairs'],
    searching: effects['custom/query'],
    submiting:
      effects['custom/req'] ||
      effects['custom/createSwap'] ||
      effects['user/transferAll'] ||
      false,
  };
})
export default class CreatePair extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { allPairs, dispatch } = this.props;
    if (!allPairs[bsvtsc]) {
      dispatch({
        type: 'pair/getAllPairs',
      });
    }
  }

  renderSteps() {
    const { step } = this.state;
    return (
      <div className={styles.steps}>
        <Steps current={step} progressDot>
          {stepData.map((item) => (
            <Step title={item} key={item} />
          ))}
        </Steps>
      </div>
    );
  }

  change = async (e, index) => {
    const { value } = e.target;
    if (!value) {
      return this.setState(
        index === 1
          ? {
              token1: undefined,
            }
          : {
              token2: undefined,
            },
      );
    }
    if (index === 1 && e.target.value.toUpperCase() === 'BSV') {
      return this.setState({
        token1: {
          symbol: 'BSV',
          name: 'Bitcoin SV',
        },
      });
    } else {
      const { dispatch } = this.props;
      const res = await dispatch({
        type: 'custom/query',
        payload: {
          genesisHash: e.target.value,
        },
      });
      if (e.target.value.toUpperCase() === 'BSV') return;
      if (!res || res.code) {
        return this.setState(
          index === 1
            ? {
                token1: undefined,
              }
            : {
                token2: undefined,
              },
        );
      } else {
        this.setState(
          index === 1
            ? {
                token1: res,
              }
            : {
                token2: res,
              },
        );
      }
    }
  };

  gotoPayStep = () => {
    this.setState({
      step: 1,
    });
  };

  editPair = (index) => {
    this.setState({
      step: 0,
    });
    // index === 1 ?
    // this.formRef.current.setFieldsValue({
    //   genesis1: this.state.token1.genesis,
    // })
    // :
    // this.formRef.current.setFieldsValue({
    //   genesis2: this.state.token2.genesis,
    // })
  };

  finish = () => {
    const { token2 } = this.state;
    history.push(`/pool/${token2.genesis}/add`);
    EventBus.emit('reloadPair');
  };

  renderContent0() {
    const { token1, token2 } = this.state;
    // const { searching } = this.props;
    return (
      <div className={styles.create_content}>
        <div className={styles.title}>
          {_('input')} A: {_('enter_bsv_or_tokenid')}
        </div>

        <div
          className={
            token1
              ? jc(styles.input_wrap, styles.input_result)
              : styles.input_wrap
          }
        >
          <FormItem name="genesis1">
            <Input.TextArea
              className={styles.input}
              onChange={(e) => this.change(e, 1)}
            />
          </FormItem>

          {token1 && (
            <div className={styles.token_info}>
              <TokenLogo
                name={token1.symbol}
                genesisID={token1.genesis || 'bsv'}
              />
              <div className={styles.token_name}>
                <div className={styles.symbol}>{token1.symbol}</div>
                <div className={styles.full_name}>{token1.name}</div>
              </div>
            </div>
          )}
        </div>
        <Plus />
        <div className={styles.title}>
          {_('input')} B: {_('enter_tokenid')}
        </div>
        <div
          className={
            token2
              ? jc(styles.input_wrap, styles.input_result)
              : styles.input_wrap
          }
        >
          <FormItem name="genesis2">
            <Input.TextArea
              className={styles.input}
              onChange={(e) => this.change(e, 2)}
            />
          </FormItem>
          {token2 && (
            <div className={styles.token_info}>
              <TokenLogo name={token2.symbol} genesisID={token2.genesis} />
              <div className={styles.token_name}>
                <div className={styles.symbol}>{token2.symbol}</div>
                <div className={styles.full_name}>{token2.name}</div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.desc}>
          {_('find_tokenid')}{' '}
          <a href="https://blockcheck.info/" target="_blank">
            BlockCheck
          </a>
        </div>

        {this.renderButton()}
      </div>
    );
  }

  renderContent1() {
    const { token1, token2 } = this.state;
    return (
      <div className={styles.create_content}>
        <div className={styles.title}>{_('confirm_and_pay')}</div>
        <div className={styles.info}>
          <div className={styles.sub_title}>
            {token1.symbol}/{token2.symbol} {_('pair')}
          </div>
          <div className={styles.line}>
            <div className={styles.coin}>
              <TokenLogo
                name={token1.symbol}
                genesisID={token1.genesis || 'bsv'}
                size={25}
              />
              <div className={styles.name}>{token1.symbol}</div>
            </div>
            <div className={styles.op}>
              <span className={styles.edit} onClick={() => this.editPair(1)}>
                {_('edit')}
              </span>
            </div>
          </div>
          <div className={styles.line}>
            <div className={styles.coin}>
              <TokenLogo
                name={token2.symbol}
                genesisID={token2.genesis}
                size={25}
              />
              <div className={styles.name}>{token2.symbol}</div>
            </div>
            <div className={styles.op}>
              <span className={styles.edit} onClick={() => this.editPair(2)}>
                {_('edit')}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.desc}>{_('confirm_pair_desc')}</div>
        {this.renderButton()}
      </div>
    );
  }

  renderContent2() {
    const { token1 = {}, token2 = {} } = this.state;
    return (
      <div className={styles.create_content}>
        <SuccessResult
          suscces_txt={_('create_success')}
          done={this.finish}
          title={
            <div className={styles.finish_title}>
              {token1.symbol}/{token2.symbol}
            </div>
          }
          noLine={true}
        >
          <div className={styles.info}>
            <div className={styles.line}>
              <div className={styles.label}>{_('pooled', token1.symbol)}</div>
              <div className={styles.no}>0.0</div>
            </div>
            <div className={styles.line}>
              <div className={styles.label}>{_('pooled', token2.symbol)}</div>
              <div className={styles.no}>0.0</div>
            </div>
            <div className={styles.line}>
              <div className={styles.label}>{_('your_share')}</div>
              <div className={styles.no}>0%</div>
            </div>
          </div>
        </SuccessResult>
      </div>
    );
  }

  payFee = async () => {
    const { accountInfo, dispatch, allPairs, rabinApis } = this.props;
    const { userAddress, changeAddress } = accountInfo;
    const res = await dispatch({
      type: 'custom/req',
      payload: {
        address: userAddress,
      },
    });
    // console.log(res);
    if (res.msg) {
      return message.error(res.msg);
    }
    const {
      requestIndex,
      tokenToAddress,
      bsvToAddress,
      txFee,
      op,
      requiredTscAmount,
    } = res;
    let genesisHash, codeHash;
    if (isTestNet()) {
      genesisHash = '52e6021649be1d0621c52c9f61a54ef58c6d8dbe';
      codeHash = '777e4dd291059c9f7a0fd563f7204576dcceb791';
    } else {
      const payToken = allPairs[bsvtsc].token2;
      genesisHash = payToken.tokenID;
      codeHash = payToken.codeHash;
    }

    let tx_res = await dispatch({
      type: 'user/transferAll',
      payload: {
        datas: [
          {
            type: 'bsv',
            address: bsvToAddress,
            amount: txFee,
            changeAddress,
            note: 'tswap.io(createSwap)',
          },
          {
            type: 'sensibleFt',
            address: tokenToAddress,
            amount: requiredTscAmount,
            changeAddress,
            codehash: codeHash,
            genesis: genesisHash,
            rabinApis,
            note: 'tswap.io(createSwap)',
          },
        ],
        noBroadcast: true,
      },
    });

    if (!tx_res) {
      return message.error(_('txs_fail'));
    }
    if (tx_res.msg) {
      return message.error(tx_res.msg);
    }
    if (tx_res.list) {
      tx_res = tx_res.list;
    }
    // if (!tx_res[0] || !tx_res[0].txid || !tx_res[1] || !tx_res[1].txid) {
    //   return message.error(_('txs_fail'));
    // }

    const { token1, token2 } = this.state;

    const payload = {
      requestIndex,
      bsvRawTx: tx_res[0].txHex,
      bsvOutputIndex: 0,
      tokenRawTx: tx_res[1].txHex,
      tokenOutputIndex: 0,
      amountCheckRawTx: tx_res[1].routeCheckTxHex,
      token1ID: token1.genesis,
      token2ID: token2.genesis,
    };
    // console.log(payload);
    let create_data = JSON.stringify(payload);

    create_data = await gzip(create_data);

    const create_res = await dispatch({
      type: 'custom/createSwap',
      payload: {
        data: create_data,
      },
    });

    if (create_res.code && !create_res.data) {
      return message.error(create_res.msg);
    }
    message.success('success');
    this.setState({
      step: 2,
    });
  };

  renderButton = () => {
    const { isLogin } = this.props;
    const { token2, step } = this.state;

    const conditions = [
      { key: 'login', cond: !isLogin },
      { cond: !token2, txt: _('select_token_pair') },
    ];
    const btn = BtnWait(conditions);
    if (btn) {
      return btn;
    }

    if (step === 0) {
      // 数额太小
      return (
        <Button
          className={styles.btn}
          shape="round"
          type="primary"
          onClick={this.gotoPayStep}
        >
          {_('next_step')}
        </Button>
      );
    } else if (step === 1) {
      // 余额不足
      return (
        <Button
          className={styles.btn}
          shape="round"
          type="primary"
          onClick={this.payFee}
        >
          {_('pay_listing_fee')}
        </Button>
      );
    } else if (step === 2) {
      // 余额不足
      return (
        <Button className={styles.btn} shape="round" type="primary">
          {_('done')}
        </Button>
      );
    }
  };

  render() {
    const { loading, submiting } = this.props;
    if (loading) return <Loading />;
    const { step } = this.state;
    return (
      <Pool pageName="createPair">
        <Spin spinning={submiting}>
          <div className={styles.container}>
            <PoolMenu currentMenuIndex={2} />
            {this.renderSteps()}
            <Form ref={this.formRef}>
              {step === 0 && this.renderContent0()}
              {step === 1 && this.renderContent1()}
              {step === 2 && this.renderContent2()}
            </Form>
          </div>
        </Spin>
      </Pool>
    );
  }
}
