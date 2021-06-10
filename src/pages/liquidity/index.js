'use strict';
import React, { Component } from 'react';
import { jc } from 'common/utils';
import TokenLogo from 'components/tokenicon';
import styles from './index.less';
import _ from 'i18n';
import { Steps, Button, Form, InputNumber, Spin, message } from 'antd';
import { QuestionCircleOutlined, DownOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import SelectToken from '../selectToken';
import { withRouter, connect } from 'umi';
import BigNumber from 'bignumber.js';
import { formatAmount } from 'common/utils';
// import EventBus from 'common/eventBus';
import Volt from '../../lib/volt';

const { Step } = Steps;
const FormItem = Form.Item;

const menu = [
    {
        key: 'add',
        label: _('add_liq')
    },
    // {
    //     key: 'create',
    //     label: _('create_pair'),
    // }
];
@withRouter
@connect(({ pair, loading }) => {
    const { effects } = loading;
    return {
        ...pair,
        loading: effects['pair/getAllPairs'] || effects['pair/getPairData']
    }

})
export default class Liquidity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 'form',
            formFinish: false,
            showDetail: false,
            currentMenuItem: menu[0].key,
            currentStep: 1,
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


    showUI = (name) => {

        this.setState({
            page: name
        })
    }

    renderStep() {
        const { currentStep } = this.state;
        return <Steps progressDot current={currentStep} className={styles.steps}>
            <Step title={_('select_pair')} />
            <Step title={_('add_liq')} />
            <Step title={_('promote')} />
        </Steps>
    }

    renderInfo() {
        const { token1, token2, pairData } = this.props;
        const { origin_amount = 0, aim_amount = 0 } = this.state;
        let total_origin_amount = origin_amount, total_aim_amount = aim_amount;

        total_origin_amount = formatAmount(BigNumber(origin_amount).plus(BigNumber(pairData.swapToken1Amount).div(1e8)), 8).toString();
        total_aim_amount = formatAmount(BigNumber(aim_amount).plus(BigNumber(pairData.swapToken2Amount).div(1e8)), 8).toString();
        const share = origin_amount > 0 ? formatAmount(BigNumber(origin_amount).div(total_origin_amount).multipliedBy(100), 2).toString() : 0
        return <div className={styles.my_pair_info}>
            <div className={styles.info_title_swap}>
                <div className={styles.info_title}>{_('pool_share')}</div>
                <div className={styles.help}><QuestionCircleOutlined /></div>
            </div>

            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('pooled')} {token1.symbol}</div>
                <div className={styles.info_value}>{total_origin_amount}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('pooled')} {token2.symbol}</div>
                <div className={styles.info_value}>{total_aim_amount}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('your_share')}</div>
                <div className={styles.info_value}>{share}%</div>
            </div>
        </div>
    }

    renderForm() {
        const { token1, token2, loading } = this.props;
        return <div className={styles.content}>
            <Spin spinning={loading}>
                <Form onSubmit={this.handleSubmit} ref={this.formRef}>
                    {this.renderStep()}
                    <div className={styles.title}>
                        <h3>{_('input')}</h3>
                        <div className={styles.balance}>{_('your_balance')}: <span>{token1.value || 0} {token1.symbol}</span></div>
                    </div>
                    <div className={styles.box}>
                        <div className={styles.coin}>
                            <TokenLogo name={token1.symbol} />
                            <div className={styles.name}>{token1.symbol}</div>
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
                        <div className={styles.balance}>{_('balance')}: <span>{token2.value || 0} {token2.symbol || ''}</span></div>
                    </div>

                    <div className={styles.box}>
                        <div className={styles.coin}>
                            <div style={{ width: 40 }}>{token2.symbol && <TokenLogo name={token2.symbol} />}</div>
                            <div className={styles.name}>{token2.symbol || _('select')}</div>
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
        Volt.login()
    }


    renderButton = () => {
        const { isLogin, token1, token2 } = this.props;
        const { origin_amount, aim_amount } = this.state;
        // if (!isLogin) {
        //     // 未登录
        //     return <Button className={styles.btn_wait} onClick={this.login}>{_('login')}</Button>
        // }
        // else if (!origin_token_id || !aim_token_id) {
        //     //未选择Token
        //     return <Button className={styles.btn_wait}>{_('select_a_token_pair')}</Button>
        // } 
        // else 
        if (parseFloat(origin_amount) <= 0 || parseFloat(aim_amount) <= 0) {
            // 未输入数量
            return <Button className={styles.btn_wait}>{_('enter_amount')}</Button>;
        }
        // else if (parseFloat(origin_amount) > parseFloat(token1.value || 0)) {
        //     // 余额不足
        //     return <Button className={styles.btn_wait}>{_('lac_token_balance', token1.symbol)}</Button>
        // } else if (parseFloat(aim_amount) > parseFloat(token2.value || 0)) {
        //     // 余额不足
        //     return <Button className={styles.btn_wait}>{_('lac_token_balance', token2.symbol)}</Button>
        // } 
        else {
            return <>
                {this.renderInfo()}
                <Button className={styles.btn} type='primary' onClick={this.handleSubmit}>{_('supply_liq')}</Button>
            </>;
        }
    }

    handleSubmit = async () => {
        const { origin_amount, aim_amount } = this.state;
        const { dispatch, currentPair } = this.props;
        console.log(origin_amount, aim_amount);


        // let res = await dispatch({
        //     type: 'pair/reqSwap',
        //     payload: {
        //         symbol: currentPair,
        //         op: 1
        //     }
        // });
        let res = {
            bsvToAddress: "1CX7iRxnDDtF2NpHdwSL8GXvCsMKAZtFSg",
            op: 1,
            projFeeRate: 5,
            requestIndex: "10",
            swapFeeRate: 25,
            swapLpAmount: "600000",
            swapToken1Amount: "525022",
            swapToken2Amount: "687029",
            tokenToAddress: "15h2jKafZmifkqB9cnwofBb2pu9GniqVRy",
            txFee: 93978
        }

        if (res.code) {
            return message.error(res.msg)
        }
        const res1 = await dispatch({
            type: 'pair/addLiq',
            payload: {
                symbol: currentPair,
                requestIndex: res.data.requestIndex,
                token1TxID: 'a136c3eb1f1b1999e58b61bc84ef08fcdb2132729f1f3564b099a5786e49e714',
                token1OutputIndex: 1,
                token2TxID: '',
                token2OutputIndex: 1,
                token1AddAmount: BigNumber(origin_amount).multipliedBy(1e8).toNumber()
            }
        });

        if (res1.code) {
            return message.error(res1.msg);
        }
        message.success('success')
    }

    renderResult() {
        return <div className={styles.content}>
            {this.renderStep()}

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

        const { formFinish, currentMenuItem, page } = this.state;

        return <div className={styles.container} style={{ display: page === 'form' ? 'block' : 'none' }}>
            <div className={styles.head}>
                <div className={styles.menu}>
                    {menu.map(item => {
                        let cls = jc(styles.menu_item);
                        if (item.key === currentMenuItem) {
                            cls = jc(styles.menu_item, styles.menu_item_selected);
                        }
                        return <span className={cls} key={item.key}>{item.label}</span>
                    })}
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
                currentStep: 1,
                origin_amount: 0,
                aim_amount: 0
            });

            this.formRef.current.setFieldsValue({ origin_amount: 0, aim_amount: 0 });
        }
    }

    payCallback = (value) => {
        if (value) {


            this.setState({
                currentStep: 2,
                formFinish: true
            })
        }
        this.closePayPop();

    }

    render() {
        const { page } = this.state;
        return <div style={{ position: 'relative' }}>
            {this.renderSwap()}
            {(page === 'selectToken') && <div className={styles.selectToken_wrap}><SelectToken close={(id) => this.selectedToken(id, page)} /></div>}

        </div>
    }
}