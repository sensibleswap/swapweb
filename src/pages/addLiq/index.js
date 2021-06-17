'use strict';
import React, { Component } from 'react';
import { withRouter, connect } from 'umi';
import BigNumber from 'bignumber.js';
import { Button, Form, InputNumber, Spin, message } from 'antd';
import { QuestionCircleOutlined, DownOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import TokenLogo from 'components/tokenicon';
import Loading from 'components/loading';
import { formatAmount, jc } from 'common/utils';
import EventBus from 'common/eventBus';
import SelectToken from '../selectToken';
import Pool from '../pool';
import styles from './index.less';
import _ from 'i18n';
// import Volt from '../../lib/volt';

const FormItem = Form.Item;
@withRouter
@connect(({ user, pair, loading }) => {
    const { effects } = loading;
    return {
        ...user,
        ...pair,
        loading: effects['pair/getAllPairs'] || effects['pair/getPairData'],
        submiting: effects['pair/reqSwap'] || effects['pair/addLiq'] || effects['user/transferBsv'] || effects['user/transferFtTres'] || false
    }

})
export default class Liquidity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 'form',
            formFinish: false,
            showDetail: false,
            origin_amount: 0,
            aim_amount: 0,
            lp: 0
        }
        this.formRef = React.createRef();
    }

    componentDidMount() {
        this.fetch()
    }

    async fetch() {

        const { dispatch, } = this.props;
        await dispatch({
            type: 'pair/getAllPairs',
        });

        let { currentPair } = this.props;
        await dispatch({
            type: 'pair/getPairData',
            payload: {
                currentPair
            }
        })
    }

    changeOriginAmount = (value) => {

        const { swapToken1Amount, swapToken2Amount, swapLpAmount } = this.props.pairData;

        let user_aim_amount = 0;
        let lpMinted = 0;
        if (swapLpAmount > 0) {
            user_aim_amount = formatAmount(BigNumber(value).multipliedBy(swapToken2Amount).div(swapToken1Amount), 8);
            lpMinted = BigNumber(value).multipliedBy(swapLpAmount).div(swapToken1Amount);
        }

        this.formRef.current.setFieldsValue({
            aim_amount: user_aim_amount,
        });
        this.setState({
            origin_amount: value,
            aim_amount: user_aim_amount,
            lp: lpMinted
        });
    }

    changeAimAmount = (value) => {

        const { swapToken1Amount, swapToken2Amount, swapLpAmount } = this.props.pairData;

        let user_origin_amount = 0;
        let lpMinted = 0;
        if (swapLpAmount > 0) {
            user_origin_amount = formatAmount(BigNumber(value).multipliedBy(swapToken1Amount).div(swapToken2Amount), 8);
            // lpMinted = token1AddAmount * swapLpTokenAmount / swapToken1Amount; //也是swapToken1Amount？
            lpMinted = BigNumber(user_origin_amount).multipliedBy(swapLpAmount).div(swapToken1Amount)
        }
        this.formRef.current.setFieldsValue({
            origin_amount: user_origin_amount,
        });
        this.setState({
            aim_amount: value,
            origin_amount: user_origin_amount,
            lp: lpMinted
        });

    }


    setOriginBalance = () => {
        const { userBalance, pairData } = this.props;
        const { swapLpAmount, swapToken1Amount, swapToken2Amount } = pairData;
        const origin_amount = userBalance.BSV || 0;
        let aim_amount, lp;
        if (swapLpAmount > 0) {
            aim_amount = formatAmount(BigNumber(origin_amount).multipliedBy(swapToken2Amount).div(swapToken1Amount), 8);
            lp = BigNumber(origin_amount).multipliedBy(swapLpAmount).div(swapToken1Amount);
        }
        this.formRef.current.setFieldsValue({
            origin_amount,
            aim_amount
        });
        this.setState({
            origin_amount,
            aim_amount,
            lp
        })

    }


    setAimBalance = () => {
        const { userBalance, token2, pairData } = this.props;
        const { swapLpAmount, swapToken1Amount, swapToken2Amount } = pairData;
        const aim_amount = userBalance[token2.codeHash] || 0;
        let origin_amount, lp;
        if (swapLpAmount > 0) {
            origin_amount = formatAmount(BigNumber(aim_amount).multipliedBy(swapToken1Amount).div(swapToken2Amount), 8);
            lp = BigNumber(origin_amount).multipliedBy(swapLpAmount).div(swapToken1Amount)
        }
        this.formRef.current.setFieldsValue({
            origin_amount,
            aim_amount
        });
        this.setState({
            origin_amount,
            aim_amount,
            lp
        })

    }

    showUI = (name) => {

        this.setState({
            page: name
        })
    }

    renderInfo() {
        const { token1, token2, pairData } = this.props;
        const { origin_amount = 0, aim_amount = 0 } = this.state;
        let total_origin_amount = origin_amount, total_aim_amount = aim_amount;

        total_origin_amount = formatAmount(BigNumber(origin_amount).plus(BigNumber(pairData.swapToken1Amount).div(Math.pow(10, token1.decimal))), 8).toString();
        total_aim_amount = formatAmount(BigNumber(aim_amount).plus(BigNumber(pairData.swapToken2Amount).div(Math.pow(10, token2.decimal))), 8).toString();
        const share = origin_amount > 0 ? formatAmount(BigNumber(origin_amount).div(total_origin_amount).multipliedBy(100), 2).toString() : 0
        return <div className={styles.my_pair_info}>
            <div className={styles.info_title_swap}>
                <div className={styles.info_title}>{_('pool_share')}</div>
                <div className={styles.help}><QuestionCircleOutlined /></div>
            </div>

            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('pooled')} {token1.symbol.toUpperCase()}</div>
                <div className={styles.info_value}>{total_origin_amount}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('pooled')} {token2.symbol.toUpperCase()}</div>
                <div className={styles.info_value}>{total_aim_amount}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('your_share')}</div>
                <div className={styles.info_value}>{share}%</div>
            </div>
        </div>
    }

    renderForm() {
        const { token1, token2, userBalance, submiting } = this.props;
        const symbol1 = token1.symbol.toUpperCase();
        const symbol2 = token2.symbol.toUpperCase();
        return <div className={styles.content}>
            <Spin spinning={submiting}>
                <Form onSubmit={this.handleSubmit} ref={this.formRef}>
                    <div className={styles.title}>
                        <h3>{_('input')}</h3>
                        <div className={styles.balance} onClick={this.setOriginBalance}>{_('your_balance')}: <span>{userBalance.BSV || 0} {symbol1}</span></div>
                    </div>
                    <div className={styles.box}>
                        <div className={styles.coin}>
                            <TokenLogo name={symbol1} />
                            <div className={styles.name}>{symbol1}</div>
                            <DownOutlined onClick={() => this.showUI('selectToken')} />
                        </div>
                        <FormItem
                            name={'origin_amount'}>
                            <InputNumber className={styles.input} onChange={this.changeOriginAmount} min='0'
                                formatter={value => parseFloat(value || 0)} />
                        </FormItem>
                    </div>

                    <div className={styles.switch_icon}>
                        <PlusOutlined />
                    </div>


                    <div className={styles.title}>
                        <h3>{_('input')}</h3>
                        <div className={styles.balance} onClick={this.setAimBalance}>{_('balance')}: <span>{userBalance[token2.codeHash] || 0} {symbol2 || ''}</span></div>
                    </div>

                    <div className={styles.box}>
                        <div className={styles.coin}>
                            <div style={{ width: 40 }}><TokenLogo name={symbol2} /></div>
                            <div className={styles.name}>{symbol2 || _('select')}</div>
                            <DownOutlined onClick={() => this.showUI('selectToken')} />
                        </div>
                        <FormItem
                            name={'aim_amount'}>
                            <InputNumber className={styles.input} onChange={this.changeAimAmount} min='0'
                                formatter={value => parseFloat(value || 0)} />
                        </FormItem>
                    </div>
                    {this.renderButton()}
                </Form>
            </Spin>
        </div>
    }


    login() {
        EventBus.emit('login')
    }


    renderButton = () => {
        const { isLogin, token1, token2, userBalance } = this.props;
        const { origin_amount, aim_amount } = this.state;
        if (!isLogin) {
            // 未登录
            return <Button className={styles.btn_wait} onClick={this.login}>{_('login')}</Button>
        }
        // else if (!origin_token_id || !aim_token_id) {
        //     //未选择Token
        //     return <Button className={styles.btn_wait}>{_('select_a_token_pair')}</Button>
        // } 
        else if (parseFloat(origin_amount) <= 0 || parseFloat(aim_amount) <= 0) {
            // 未输入数量
            return <Button className={styles.btn_wait}>{_('enter_amount')}</Button>;
        }
        else if (parseFloat(origin_amount) > parseFloat(userBalance.BSV || 0)) {
            // 余额不足
            return <Button className={styles.btn_wait}>{_('lac_token_balance', token1.symbol)}</Button>
        } else if (parseFloat(aim_amount) > parseFloat(userBalance[token2.codeHash] || 0)) {
            // 余额不足
            return <Button className={styles.btn_wait}>{_('lac_token_balance', token2.symbol)}</Button>
        }
        else {
            return <div>
                {this.renderInfo()}
                <Button className={styles.btn} type='primary' onClick={this.handleSubmit}>{_('supply_liq')}</Button>
            </div>;
        }
    }

    handleSubmit = async () => {
        const { origin_amount, aim_amount } = this.state;
        const { dispatch, currentPair, userAddress, token2 } = this.props;


        let res = await dispatch({
            type: 'pair/reqSwap',
            payload: {
                symbol: currentPair,
                address: userAddress,
                op: 1
            }
        });


        if (res.code) {
            return message.error(res.msg)
        }

        const { bsvToAddress, tokenToAddress, requestIndex, txFee } = res.data;

        const _aim_amount = BigNumber(aim_amount).multipliedBy(Math.pow(10, token2.decimal)).toNumber()
        const token_tx_res = await dispatch({
            type: 'user/transferFtTres',
            payload: {
                address: tokenToAddress,
                amount: _aim_amount,
                codehash: token2.codeHash,
                genesishash: token2.genesisHash
            }
        });

        console.log(token_tx_res);

        if (token_tx_res.msg) {
            return message.error(token_tx_res.msg)
        }

        const _origin_amount = BigNumber(origin_amount).multipliedBy(1e8);
        const bsv_tx_res = await dispatch({
            type: 'user/transferBsv',
            payload: {
                address: bsvToAddress,
                amount: _origin_amount.plus(txFee).toNumber()
            }
        })
        console.log(bsv_tx_res);

        if (bsv_tx_res.msg) {
            return message.error(bsv_tx_res.msg)
        }


        const addliq_res = await dispatch({
            type: 'pair/addLiq',
            payload: {
                symbol: currentPair,
                requestIndex: requestIndex,
                token1TxID: bsv_tx_res.txid,
                token1OutputIndex: 1,
                token2TxID: token_tx_res.txid,
                token2OutputIndex: 1,
                token1AddAmount: _origin_amount.toNumber()
            }
        });

        if (addliq_res.code) {
            return message.error(addliq_res.msg);
        }
        message.success('success')
        this.setState({
            formFinish: true
        })
    }

    renderResult() {
        return <div className={styles.content}>

            <div className={styles.finish_logo}><CheckCircleOutlined style={{ fontSize: 80, color: '#2BB696' }} />
            </div>
            <div className={styles.finish_title}>{token1.symbol}/{token2.symbol}</div>
            <div className={styles.finish_desc}>{_('pair_created')}</div>

            <div className={styles.view_detail}>{_('share_pair', `${token1.symbol}/${token2.symbol}`)}</div>
            {this.renderInfo()}
            <Button className={styles.done_btn} onClick={() => {
                this.props.history.push('swap');
            }}>{_('done')}</Button>
        </div>
    }



    renderSwap() {

        const { formFinish, page } = this.state;

        return <div className={styles.container} style={{ display: page === 'form' ? 'block' : 'none' }}>
            <div className={styles.head}>
                <div className={styles.menu}>
                    <span className={jc(styles.menu_item, styles.menu_item_selected)} key='add_liq'>{_('add_liq')}</span>
                    <span className={styles.menu_item} key='remove_liq' onClick={() => {
                        this.props.history.push('remove')
                    }}>{_('remove_liq')}</span>

                </div>
                <div className={styles.help}>
                    <QuestionCircleOutlined />
                </div>
            </div>
            {formFinish ? this.renderResult() : this.renderForm()}

        </div>;
    }

    selectedToken = async (currentPair) => {

        this.showUI('form');
        if (currentPair && currentPair !== this.props.currentPair) {
            if (this.state.page === 'selectToken') {

                this.props.dispatch({
                    type: 'pair/getPairData',
                    payload: {
                        currentPair
                    }
                })
            }

            this.setState({
                origin_amount: 0,
                aim_amount: 0
            });

            this.formRef.current.setFieldsValue({ origin_amount: 0, aim_amount: 0 });
        }
    }

    payCallback = (value) => {
        if (value) {


            this.setState({
                formFinish: true
            })
        }
        this.closePayPop();

    }

    render() {
        const { loading, currentPair } = this.props;
        if (loading || !currentPair) return <Loading />
        const { page } = this.state;
        return <Pool>
            <div style={{ position: 'relative' }}>
                {this.renderSwap()}
                {(page === 'selectToken') && <div className={styles.selectToken_wrap}><SelectToken close={(id) => this.selectedToken(id, page)} /></div>}

            </div>
        </Pool>
    }
}