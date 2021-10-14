'use strict';
import React, { Component } from 'react';
import { gzip } from 'node-gzip';
import { Link, history, connect } from 'umi';
import { Steps, Button, Input, message, Form, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CustomIcon from 'components/icon';
import TokenLogo from 'components/tokenicon';
import Loading from 'components/loading';
import PoolMenu from 'components/poolMenu';
import { jc, isTestNet } from 'common/utils';
import EventBus from 'common/eventBus';
import Pool from '../pool';
import styles from './index.less';
import _ from 'i18n';

const symbol1 = 'BSV';
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

  login() {
    EventBus.emit('login');
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

  change = async (e) => {
    const { value } = e.target;
    if (!value) {
      return this.setState({
        token2: undefined,
      });
    }
    const { dispatch } = this.props;
    const res = await dispatch({
      type: 'custom/query',
      payload: {
        genesisHash: e.target.value,
      },
    });
    if (!res || res.code) {
      return this.setState({
        token2: undefined,
      });
    }
    this.setState({
      token2: res,
    });
  };

  gotoPayStep = () => {
    this.setState({
      step: 1,
    });
  };

  editPair = () => {
    this.setState({
      step: 0,
    });
    this.formRef.current.setFieldsValue({
      genesis: this.state.token2.genesis,
    });
  };

  finish = () => {
    const { token2 } = this.state;
    history.push(`/pool/${token2.genesis}/add`);
    EventBus.emit('reloadPair');
  };

  renderContent0() {
    const { token2 } = this.state;
    const { searching } = this.props;
    return (
      <div className={styles.create_content}>
        <div className={styles.title}>{_('input')} A</div>
        <div className={styles.box}>
          <div className={styles.coin}>
            <TokenLogo name={symbol1} genesisID="bsv" />
            <div className={styles.name}>{symbol1}</div>
          </div>
        </div>

        <div className={styles.switch_icon}>
          <PlusOutlined style={{ fontSize: 18 }} />
        </div>
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
          <FormItem name="genesis">
            <Input.TextArea className={styles.input} onChange={this.change} />
          </FormItem>
          {searching && <Spin />}
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
          <Link to="https://blockcheck.info/">BlockCheck</Link>
        </div>

        {this.renderButton()}
      </div>
    );
  }

  renderContent1() {
    const { token2 } = this.state;
    const { symbol } = token2;
    return (
      <div className={styles.create_content}>
        <div className={styles.title}>{_('confirm_and_pay')}</div>
        <div className={styles.info}>
          <div className={styles.sub_title}>
            {symbol1}/{token2.symbol} {_('pair')}
          </div>
          <div className={styles.line}>
            <div className={styles.coin}>
              <TokenLogo name={symbol1} genesisID="bsv" size={25} />
              <div className={styles.name}>{symbol1}</div>
            </div>
          </div>
          <div className={styles.line}>
            <div className={styles.coin}>
              <TokenLogo name={symbol} genesisID={token2.genesis} size={25} />
              <div className={styles.name}>{symbol}</div>
            </div>
            <div className={styles.op}>
              <span className={styles.edit} onClick={this.editPair}>
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
    const { token2 } = this.state;
    const { symbol } = token2;
    return (
      <div className={styles.create_content}>
        <div className={styles.finish_logo}>
          <CustomIcon
            type="iconicon-success"
            style={{ fontSize: 64, color: '#2BB696' }}
          />
        </div>
        <div className={styles.finish_title}>
          {symbol1}/{symbol}
        </div>
        <div className={styles.finish_desc}>{_('create_success')}</div>

        <div className={styles.info}>
          <div className={styles.line}>
            <div className={styles.label}>{_('pooled', symbol1)}</div>
            <div className={styles.no}>0.0</div>
          </div>
          <div className={styles.line}>
            <div className={styles.label}>{_('pooled', symbol)}</div>
            <div className={styles.no}>0.0</div>
          </div>
          <div className={styles.line}>
            <div className={styles.label}>{_('your_share')}</div>
            <div className={styles.no}>0%</div>
          </div>
        </div>
        <Button className={styles.done_btn} shape="round" onClick={this.finish}>
          {_('done')}
        </Button>
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
    console.log(res);
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
    if (!tx_res[0] || !tx_res[0].txid || !tx_res[1] || !tx_res[1].txid) {
      return message.error(_('txs_fail'));
    }

    const { token2 } = this.state;

    const payload = {
      requestIndex,
      bsvRawTx: tx_res[0].txHex,
      bsvOutputIndex: 0,
      tokenRawTx: tx_res[1].txHex,
      tokenOutputIndex: 0,
      amountCheckRawTx: tx_res[1].routeCheckTxHex,
      tokenID: token2.genesis,
    };
    console.log(payload);
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
    let btn;
    if (!isLogin) {
      // 未登录
      btn = (
        <Button className={styles.btn_wait} shape="round" onClick={this.login}>
          {_('connect_wallet')}
        </Button>
      );
    } else if (!token2) {
      // 未输入数量
      btn = (
        <Button className={styles.btn_wait} shape="round">
          {_('select_token_pair')}
        </Button>
      );
    } else if (step === 0) {
      // 数额太小
      btn = (
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
      btn = (
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
      btn = (
        <Button className={styles.btn} shape="round" type="primary">
          {_('done')}
        </Button>
      );
    }

    return btn;
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
