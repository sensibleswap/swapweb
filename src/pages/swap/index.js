'use strict';
import React, { Component } from 'react';
import { jc } from 'common/utils';
import CustomIcon from 'components/icon';
import TokenLogo from 'components/tokenicon';
import styles from './index.less';
import _ from 'i18n';
import { Button, Form, InputNumber, message } from 'antd';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import SelectToken from '../selectToken';
import Setting from '../setting';
import { connect } from 'umi';
import Volt from 'lib/volt';
import Loading from 'components/loading';
import BigNumber from 'bignumber.js';
import { slippage_data, feeRate, FEE_FACTOR } from 'common/config';
// import EventBus from 'common/eventBus';
import { formatAmount } from 'common/utils';

const { storage_name, defaultIndex, datas } = slippage_data;

const FormItem = Form.Item;

const menu = [
    {
        key: 'market',
        label: _('market')
    },
    // {
    //     key: 'limit',
    //     label: _('limit'),
    // }
];


@connect(({ pair, loading }) => {
    const { effects } = loading;
    return {
        ...pair,
        loading: effects['pair/getAllPairs'] || effects['pair/getPairData']
    }

})
export default class Swap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 'form',
            formFinish: false,
            showDetail: true,
            origin_amount: 0,
            aim_amount: 0,
            slip: 0,
            fee: 0,
            lastMod: '',
            dirForward: true //交易对方向，true正向 false反向
            // bsvToToken: true,

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

    switch = async () => {
        let { dirForward } = this.state;
        this.setState({
            dirForward: !dirForward
        }, () => {
            const { current } = this.formRef;
            const { origin_amount, aim_amount } = current.getFieldsValue(['origin_amount', 'aim_amount']);
            const { lastMod } = this.state;
            if (lastMod === 'origin') {
                current.setFieldsValue({
                    aim_amount: origin_amount
                });
                this.calcAmount(0, origin_amount);
                this.setState({
                    lastMod: 'aim',
                    aim_amount: origin_amount
                })
            } else if (lastMod === 'aim') {
                current.setFieldsValue({
                    origin_amount: aim_amount,
                });
                this.calcAmount(aim_amount, 0)
                this.setState({
                    lastMod: 'origin',
                    origin_amount: aim_amount,
                })
            }
        })

    }

    showUI = (name) => {

        this.setState({
            page: name
        })
    }

    changeOriginAmount = (value) => {

        if (value > 0) {
            const fee = BigNumber(value).multipliedBy(feeRate).toFixed(2).toString();
            this.setState({
                origin_amount: value,
                fee,
                lastMod: 'origin'
            });
            // this.calc(value - fee);
            this.calcAmount(value, 0);
        } else {
            this.formRef.current.setFieldsValue({
                aim_amount: 0,
            });
            this.setState({
                fee: 0,
                slip: 0,
                lastMod: '',
                aim_amount: 0,
            })
        }
    }

    changeAimAmount = (value) => {
        if (value > 0) {
            this.setState({
                aim_amount: value,
                lastMod: 'aim',
            });
            this.calcAmount(0, value)
        } else {
            this.formRef.current.setFieldsValue({
                origin_amount: 0,
            });
            this.setState({
                fee: 0,
                slip: 0,
                lastMod: '',
                origin_amount: 0,
            })
        }



    }

    renderOriginToken() {
        const { token1, token2 } = this.props;
        const { dirForward } = this.state;
        const origin_token = dirForward ? token1 : token2;
        return <div className={styles.box}>
            <div className={styles.coin}>
                <TokenLogo name={origin_token.symbol} />
                <div className={styles.name}>{origin_token.symbol}</div>
                <DownOutlined onClick={() => this.showUI('selectToken')} />
            </div>
            <FormItem
                name='origin_amount'>
                <InputNumber
                    className={styles.input}
                    onChange={this.changeOriginAmount}
                    onPressEnter={this.changeOriginAmount}
                    formatter={value => parseFloat(value || 0)}
                    min='0'
                />
            </FormItem>
        </div>
    }

    renderAimToken() {
        const { token1, token2, pairData } = this.props;
        const { dirForward } = this.state;
        const aim_token = dirForward ? token2 : token1;
        return <div className={styles.box}>
            <div className={styles.coin}>
                <div style={{ width: 40 }}>{aim_token.symbol && <TokenLogo name={aim_token.symbol} />}</div>
                <div className={styles.name}>{aim_token.symbol || _('select')}</div>
                <DownOutlined onClick={() => this.showUI('selectToken')} />
            </div>
            <FormItem
                name='aim_amount'>
                <InputNumber
                    className={styles.input}
                    type='number'
                    onChange={this.changeAimAmount}
                    onPressEnter={this.changeAimAmount}
                    formatter={value => parseFloat(value || 0)}
                    min='0'
                    max={Math.floor(pairData ? pairData.swapToken1Amount : 0)}
                />
            </FormItem>
        </div>
    }

    setOriginBalance = () => {
        const { token1, token2 } = this.props;
        const origin_token = this.state.dirForward ? token1 : token2;

        const origin_amount = origin_token.value || 0;
        this.formRef.current.setFieldsValue({
            origin_amount,
        });
        this.setState({
            origin_amount
        })
        this.calcAmount(origin_amount, 0)
        if (origin_amount > 0) {

            this.setState({
                // origin_amount,
                lastMod: 'origin',
                fee: BigNumber(origin_amount).multipliedBy(feeRate).toFixed(2).toString()
            });
        } else {
            this.setState({
                lastMod: ''
            })
        }
    }
    calcAmount = (originAddAmount = 0, aimAddAmount = 0) => {

        const { pairData, token1, token2 } = this.props;
        const { dirForward } = this.state;
        const { swapToken1Amount, swapToken2Amount, swapFeeRate } = pairData;
        let amount1 = dirForward ? swapToken1Amount : swapToken2Amount;
        let amount2 = dirForward ? swapToken2Amount : swapToken1Amount;
        let _originAddAmount = BigNumber(originAddAmount).multipliedBy(Math.pow(10, token1.decimal || 8));
        let _aimAddAmount = BigNumber(aimAddAmount).multipliedBy(Math.pow(10, token2.decimal || 8));
        let newAmount1, newAmount2;
        if (originAddAmount > 0) {
            const addAmountWithFee = _originAddAmount.multipliedBy(FEE_FACTOR - swapFeeRate);
            newAmount1 = BigNumber(amount1).plus(_originAddAmount);
            let removeAmount = addAmountWithFee.multipliedBy(amount2).div(BigNumber(amount1).multipliedBy(FEE_FACTOR).plus(addAmountWithFee));
            newAmount2 = BigNumber(amount2).minus(removeAmount);

            removeAmount = formatAmount(removeAmount.div(Math.pow(10, token2.decimal || 8)), 8);

            this.formRef.current.setFieldsValue({
                aim_amount: removeAmount
            })
            this.setState({
                aim_amount: removeAmount
            });
        } else if (aimAddAmount > 0) {

            newAmount2 = BigNumber(amount2).minus(_aimAddAmount);
            const addAmountWithFee = _aimAddAmount.multipliedBy(amount1).multipliedBy(FEE_FACTOR).div(newAmount2);

            let addAmount = addAmountWithFee.div(FEE_FACTOR - swapFeeRate);
            addAmount = addAmount.div(Math.pow(10, token1.decimal || 8));
            newAmount1 = addAmount.plus(amount1);
            let addAmountN = formatAmount(addAmount, 8);
            if(!addAmount.isGreaterThan(0)) {
                addAmountN = 0;
                newAmount1 = amount1;
                newAmount2 = BigNumber(amount2);
            }

            this.formRef.current.setFieldsValue({
                origin_amount: addAmountN
            });
            this.setState({
                origin_amount: addAmountN,
                fee: addAmount > 0 ? addAmount.multipliedBy(feeRate).toFixed(2).toString() : 0
            });
        } else {
            //两个值都没有大于0
            this.formRef.current.setFieldsValue({
                origin_amount: originAddAmount,
                aim_amount: aimAddAmount
            });
            this.setState({
                origin_amount: originAddAmount,
                aim_amount: aimAddAmount
            })
        }


        const p = BigNumber(amount2).dividedBy(amount1);
        const p1 = newAmount2.dividedBy(newAmount1);
        const slip = (p1.minus(p)).dividedBy(p);

        // console.log('amount1:',amount1,
        // 'amount2:', amount2,
        // 'p:', p.toNumber(),
        // 'newAmount1:', newAmount1.toNumber(),
        // 'newAmount2:', newAmount2.toNumber(),
        // 'p1:', p1.toNumber(),
        // 'slip:', slip.toNumber());
        this.setState({
            slip: slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
        });
    }


    // calc = (origin_amount = 0, aim_amount = 0) => {
    //     //TODO: aim_amount不能大于池里token的数量，但交互要怎么展示
    //     //TODO: origin_amount不能比手续费小
    //     const { pairData} = this.props;
    //     const {dirForward} = this.state;
    //     let amount1 = dirForward ? pairData.swapToken1Amount : pairData.swapToken2Amount;
    //     let amount2 = dirForward ? pairData.swapToken2Amount : pairData.swapToken1Amount;
    //     const total = BigNumber(amount1).multipliedBy(amount2);
    //     const p = BigNumber(amount2).dividedBy(amount1);
    //     let newAmount1 = amount1, newAmount2 = amount2;
    //     if (origin_amount > 0) { //输入token1计算token2
    //         newAmount1 = BigNumber(amount1).plus(origin_amount);
    //         newAmount2 = total.dividedBy(newAmount1);

    //         const v_aim = formatAmount(BigNumber(amount2).minus(newAmount2))
    //         this.formRef.current.setFieldsValue({
    //             aim_amount: v_aim
    //         })
    //         this.setState({
    //             aim_amount: v_aim
    //         })
    //     } else if (aim_amount > 0) { //输入token2计算token1
    //         newAmount2 = BigNumber(amount2).minus(aim_amount);
    //         newAmount1 = total.dividedBy(newAmount2);
    //         let v_origin = BigNumber(newAmount1).minus(amount1).dividedBy(1 - feeRate);
    //         this.formRef.current.setFieldsValue({
    //             origin_amount: formatAmount(v_origin)
    //         });
    //         this.setState({
    //             fee: formatAmount(v_origin.multipliedBy(feeRate), 2),
    //             origin_amount: formatAmount(v_origin)
    //         })
    //     }
    //     const p1 = BigNumber(newAmount2).dividedBy(newAmount1);
    //     const slip = (p1.minus(p)).dividedBy(p);

    //     this.setState({
    //         slip: slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
    //     });
    //     // if (origin_amount > 0) {
    //     // } else if (aim_amount > 0) {

    //     // } else {
    //     //     //两个值都没有大于0
    //     //     this.formRef.current.setFieldsValue({
    //     //         origin_amount,
    //     //         aim_amount
    //     //     });
    //     //     this.setState({
    //     //         origin_amount,
    //     //         aim_amount
    //     //     })

    //     // }

    // }

    renderForm = () => {
        const { token1, token2, pairData } = this.props;
        const { dirForward } = this.state;
        const origin_token = dirForward ? token1 : token2;
        const aim_token = dirForward ? token2 : token1;
        const { slip, fee } = this.state;
        const symbol1 = origin_token.symbol.toUpperCase();
        const symbol2 = aim_token.symbol.toUpperCase();

        const tol = datas[window.localStorage.getItem(storage_name)] || datas[defaultIndex];
        const beyond = parseFloat(slip) > parseFloat(tol);

        return <div className={styles.content}>
            <Form onSubmit={this.handleSubmit} ref={this.formRef}>
                <div className={styles.title}>
                    <h3>{_('you_pay')}</h3>
                    <div className={styles.balance} onClick={this.setOriginBalance}>{_('your_balance')}: <span>{origin_token.value || 0} {symbol1}</span></div>
                </div>
                {this.renderOriginToken()}

                <div className={styles.switch_icon}>
                    <div className={styles.icon} onClick={this.switch}>
                        <CustomIcon type='iconswitch' style={{ fontSize: 20 }} />
                    </div>
                    <div className={styles.line}></div>
                </div>

                <div className={styles.title}>
                    <h3>{_('you_receive')} <span className={styles.normal}>({_('estimated')})</span></h3></div>

                {this.renderAimToken()}

                <div className={styles.key_value}>
                    <div className={styles.key}>{_('price')}</div>
                    <div className={styles.value}>1 {symbol1} = {pairData.swapFeeRate} {symbol2}</div>
                </div>
                <div className={styles.key_value}>
                    <div className={styles.key}>{_('slippage_tolerance')}</div>
                    <div className={styles.value}>{tol}</div>
                </div>
                {this.renderButton()}
                <div className={styles.key_value}>
                    <div className={styles.key}>{_('price_impact')}</div>
                    <div className={styles.value} style={beyond ? { color: 'red' } : {}}>{slip}</div>
                </div>
                <div className={styles.key_value}>
                    <div className={styles.key}>{_('fee')}</div>
                    <div className={styles.value}>{fee} {symbol1}</div>
                </div>
            </Form>
        </div>
    }

    login() {
        // EventBus.emit('login')
        Volt.login()
    }

    renderButton() {
        const { isLogin, pairData, token1, token2 } = this.props;
        const { slip, lastMod, origin_amount, aim_amount, dirForward } = this.state;
        const origin_token = dirForward ? token1 : token2;

        const tol = datas[window.localStorage.getItem(storage_name)] || datas[defaultIndex];
        const beyond = parseFloat(slip) > parseFloat(tol);
        // if (!isLogin) {
        //     // 未登录
        //     return <Button className={styles.btn_wait} onClick={this.login}>{_('login')}</Button>
        // } else 
        if (!pairData) {
            // 不存在的交易对
            return <Button className={styles.btn_wait}>{_('no_pair')}</Button>
        } else if (!lastMod || (origin_amount <= 0 && aim_amount <= 0)) {
            // 未输入数量
            return <Button className={styles.btn_wait}>{_('enter_amount')}</Button>
        }
        // else if (parseFloat(origin_amount) > parseFloat(origin_token.value || 0)) {
        //     // 余额不足
        //     return <Button className={styles.btn_wait}>{_('lac_balance')}</Button>
        // } 
        else if (BigNumber(aim_amount).multipliedBy(Math.pow(10, token2.decimal || 8)).isGreaterThan(pairData.swapToken2Amount)) {
            // 池中币不足
            return <Button className={styles.btn_wait}>{_('not_enough', token2.symbol)}</Button>
        } else if (beyond) {
            // 超出容忍度
            return <Button className={styles.btn_warn} onClick={this.submit}>{_('swap_anyway')}</Button>
        } else {
            return <Button className={styles.btn} type='primary' onClick={this.submit}>{_('swap')}</Button>
        }

    }

    submit = async () => {
        const { dirForward, origin_amount, aim_amount } = this.state;
        const { dispatch, currentPair } = this.props;
        console.log(origin_amount, aim_amount);

        let payload = {
            symbol: currentPair,
            op: dirForward ? 3 : 4
        }
        // let res = await dispatch({
        //     type: 'pair/reqSwap',
        //     payload
        // });
        // let res = {
        //     code: 0,
        //     msg: "",
        //     data: {
        //         requestIndex: "8",
        //         tokenToAddress: "1ComNJuknksoBQM6AjCSEzwauwPLBK7N9p",
        //         bsvToAddress: "1JaxpdoTu1UkyqnsrgJksdN7e42onbGNEh",
        //         txFee: 60550,
        //         swapToken1Amount: "515022",
        //         swapToken2Amount: "700335",
        //         swapLpAmount: "600000",
        //         swapFeeRate: 25,
        //         projFeeRate: 5,
        //         op: 3
        //     }
        // }
        let res = {
            code: 0,
            msg: "",
            data: {
            bsvToAddress: "1Bw2qjVAPcxTWbzT1r4N37qosJLZEC32eN",
            op: 4,
            projFeeRate: 5,
            requestIndex: "9",
            swapFeeRate: 25,
            swapLpAmount: "600000",
            swapToken1Amount: "525022",
            swapToken2Amount: "687029",
            tokenToAddress: "19PLTv5WtJwZCJnRN3jhgzGL6u95eytQ1f",
            txFee: 63737
            }
        }

        if (res.code) {
            return message.error(res.msg)
        }

        payload = {
            ...payload,
            requestIndex: res.data.requestIndex,
        }
        if (dirForward) {
            payload = {
                ...payload,
                token1TxID: '6c9c29190ca247f2f34361f900ac9fa14f0da0e9234c0ae9306b2d4c635923e1',
                token1OutputIndex: 1,
                token1AddAmount: BigNumber(origin_amount).multipliedBy(1e8).toNumber()
            }
        } else {
            payload = {
                ...payload,
                minerFeeTxID: 'd6c4fb357e663adbdf62225c4cab4ca13a4fcdf2eae1e6a03b72024932ba953d',
                minerFeeTxOutputIndex: 1,
                token2TxID: 'f02c0138dcaae8a9327886e694e0c5fe2fc30f7395cda1d4091b6920b4151881',
                token2OutputIndex: 1,
            }
        }

        const res1 = await dispatch({
            type: 'pair/swap',
            payload
        });
        console.log(res1);
        if (res1.code) {
            return message.error(res1.msg);
        }
        message.success('success')

    }

    viewDetail = () => {
        this.setState({
            showDetail: true
        })
    }
    closeDetail = () => {
        this.setState({
            showDetail: false
        })
    }

    renderResult() {
        const { showDetail, origin_amount, aim_amount, fee, dirForward } = this.state;
        const { accountName, token1, token2 } = this.props;
        const origin_token = dirForward ? token1 : token2;
        const aim_token = dirForward ? token2 : token1;

        return <div className={styles.content}>
            <div className={styles.finish_logo}>
            </div>
            <div className={styles.finish_title}>{_('swapping_for').replace('%1', origin_token.symbol).replace('%2', aim_token.symbol)}</div>

            {showDetail ? <div className={styles.detail}>
                <div className={styles.detail_title}>{_('tx_details')}
                    {/*<span className={styles.detail_close}><CloseOutlined onClick={this.closeDetail} /></span>*/}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className={styles.detail_item}>
                        <div className={styles.item_label}>{_('status')}</div>
                        <div className={styles.item_value}>0 {_('confirmation')}</div>
                    </div>
                    <div className={styles.detail_item}>
                        <div className={styles.item_label}>{_('volt_account')}</div>
                        <div className={styles.item_value}>{accountName}</div>
                    </div>

                </div>
                <div className={styles.detail_item}>
                    <div className={styles.item_label}>{_('paid')}</div>
                    <div className={styles.item_value}>{origin_amount} {origin_token.symbol}</div>
                </div>
                <div className={styles.detail_item}>
                    <div className={styles.item_label}>{_('received')}</div>
                    <div className={styles.item_value}>{aim_amount} {aim_token.symbol}</div>
                </div>
                <div className={styles.detail_item}>
                    <div className={styles.item_label}>{_('swap_fee')}</div>
                    <div className={styles.item_value}>{fee} {origin_token.symbol}</div>
                </div>
                <div className={styles.detail_item}>
                    <div className={styles.item_label}>{_('date')}</div>
                    <div className={styles.item_value}>{ }</div>
                </div>
                <div className={styles.detail_item}>
                    <div className={styles.item_label}>{_('onchain_tx')}</div>
                    <div className={styles.item_value}>Block @23923656</div>
                </div>
            </div> : <div className={styles.view_detail} onClick={this.viewDetail}>{_('view_tx_detail')}</div>}
            <Button className={styles.done_btn}>{_('done')}</Button>
        </div>
    }


    renderSwap() {

        const { formFinish } = this.state;

        return <div className={styles.container}>
            <div className={styles.head}>
                <div className={styles.menu}>
                    {menu.map(item => {
                        let cls = jc(styles.menu_item, styles[`menu_item_${item.key}`]);
                        if (item.key === menu[0].key) {
                            cls = jc(styles.menu_item, styles.menu_item_selected, styles[`menu_item_${item.key}`]);
                        }
                        return <span className={cls} onClick={() => this.gotoPage(item.key)} key={item.key}>{item.label}</span>
                    })}
                </div>
                <div className={styles.setting}>
                    <SettingOutlined onClick={() => this.showUI('setting')} />
                </div>
            </div>
            {formFinish ? this.renderResult() : this.renderForm()}

        </div>;
    }

    selectedToken = (currentPair) => {
        if (currentPair && currentPair !== this.props.currentPair) {
            // if (this.state.page === 'selectToken') {
                this.props.dispatch({
                    type: 'pair/getPairData',
                    payload: {
                        currentPair
                    }
                })
            // }
            this.setState({
                origin_amount: 0,
                aim_amount: 0
            })
        }
        this.showUI('form');
    }

    render() {

        const { currentPair, loading } = this.props;
        if (loading || !currentPair) return <Loading />
        const { page } = this.state;
        return <div style={{ position: 'relative' }}>
            {this.renderSwap()}
            <div style={{ position: 'absolute', top: 0, left: 0, display: (page === 'selectToken') ? 'block' : 'none' }}>
                <div className={styles.selectToken_wrap}>
                    <SelectToken close={(id) => this.selectedToken(id, page)} />
                </div>
            </div>
            <div style={{ position: 'absolute', top: 0, left: 0, display: page === 'setting' ? 'block' : 'none' }}><Setting close={() => this.showUI('form')} /></div>

        </div>
    }
}