'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import { Slider, Button } from 'antd';
// import Chart from 'components/chart';
import CustomIcon from 'components/icon';
import Pair from 'components/pair';
import Loading from 'components/loading';
import TokenLogo from 'components/tokenicon';
import { CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { formatSat, formatAmount } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';

import Header from '../layout/header';
import { Link, withRouter } from 'umi';
import BigNumber from 'bignumber.js';


const datas = [
    {
        label: '25%',
        value: 25,
    },
    {
        label: '50%',
        value: 50,
    },
    {
        label: '75%',
        value: 75,
    },
    {
        label: _('max'),
        value: 100,
    },
]

@withRouter
@connect(({ pair, loading }) => {
    const { effects } = loading;
    return {
        ...pair,
        loading: effects['pair/getAllPairs'] || effects['pair/getPairData']
    }

})
export default class RemovePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            page: 'form',
            symbol1: '',
            symbol2: '',
            removeToken1: 0,
            removeToken2: 0,
            price: 0
        }
    }

    componentDidMount() {
        this.fetch()
    }

    // async fetch() {

    //     const { dispatch, } = this.props;
    //     await dispatch({
    //         type: 'pair/getAllPairs',
    //     });

    //     let { currentPair } = this.props;
    //     await dispatch({
    //         type: 'pair/getPairData',
    //         payload: {
    //             currentPair
    //         }
    //     })
    // }

    async fetch() {

        const { dispatch} = this.props;
        const allPairs = await dispatch({
            type: 'pair/getAllPairs',
        });
        console.log(allPairs);

        let { currentPair } = this.props;
        console.log(currentPair)
        const pairData = await dispatch({
            type: 'pair/getPairData',
            payload: {
                currentPair
            }
        });
        console.log(pairData);

        const {swapToken1Amount, swapToken2Amount} = pairData;
        const {token1,token2} = allPairs[currentPair];
        const symbol1 = token1.symbol.toUpperCase();
        const symbol2 = token2.symbol.toUpperCase();
        const price = BigNumber(swapToken2Amount).div(swapToken1Amount).toNumber();
        this.setState({
            symbol1,
            symbol2,
            price
        })
    }

    renderContent() {

        const { currentPair, pairData, loading, LP, allPairs } = this.props;
        if (loading || !currentPair) return <Loading />;
        const { symbol1, symbol2 } = this.state;
        return <div className={styles.content}>
            <div className={styles.main_title}>
                <h2>
                    <div className={styles.icon}>
                        <TokenLogo name={symbol1} size={40} />
                        <TokenLogo name={symbol2} size={40} />
                    </div>
                    <div className={styles.name}>{symbol1}/{symbol2}</div>
                </h2>
                <div className={styles.subtitle}>{_('your_liq')}</div>
                <div className={styles.fiat}>$</div>
            </div>
            <Pair pairData={pairData} curPair={allPairs[currentPair]} LP={LP} />

        </div>;
    }

    changeData = (value) => {
        this.setState({ value })
    }

    slideData = (value) => {
        this.setState({ value })
    }
    calc = () => {

        const { value } = this.state;
        const { currentPair, pairData, LP, allPairs } = this.props;
        const {swapToken1Amount, swapToken2Amount, swapLpAmount} = pairData;
        const removeLP = LP*value/100;
        const rate = removeLP/swapLpAmount;
        const {token1,token2} = allPairs[currentPair];
        const removeToken1 = formatSat(swapToken1Amount*rate, token1.decimal || 8);
        const removeToken2 = formatSat(swapToken2Amount*rate, token2.decimal || 8);
        return {removeToken1, removeToken2, removeLP}
    }

    renderForm() {
        const { currentPair, loading } = this.props;
        if (loading || !currentPair) return <Loading />;
        const { value, price, symbol1, symbol2 } = this.state;
        const {removeToken1, removeToken2, removeLP} = this.calc();
        return <div className={styles.bd}>

            <div className={styles.title}>
                <h3>{_('remove_liq')}</h3>
            </div>
            <div className={styles.data}>
                {value}%
        </div>
            <Slider value={value} onChange={this.slideData} />

            <div className={styles.datas}>
                {datas.map(item => (
                    <div className={styles.d} onClick={() => this.changeData(item.value)} key={item.value}>{item.label}</div>
                ))}
            </div>

            <div className={styles.pair_box}>
                <div className={styles.pair_left}>
                    <div className={styles.icon}>
                        <TokenLogo name={symbol1} size={25} />
                        <TokenLogo name={symbol2} size={25} />
                    </div>
                    <div className={styles.name}>{symbol1}/{symbol2}</div>
                </div>
                <div className={styles.pair_right}>{removeLP}</div>
            </div>

            <div className={styles.switch_icon}>
                <div className={styles.icon} onClick={this.switch}>
                    <CustomIcon type='iconswitch' style={{ fontSize: 20 }} />
                </div>
                <div className={styles.line}></div>
            </div>

            <div className={styles.values}>
                <div className={styles.v_item}>
                    <div className={styles.value}>{removeToken1}</div>
                    <div className={styles.label}><TokenLogo name={symbol1} size={30} /> {symbol1}</div>
                </div>
                <div className={styles.v_item}>
                    <div className={styles.value}>{removeToken2}</div>
                    <div className={styles.label}><TokenLogo name={symbol2} size={25} /> {symbol2}</div>
                </div>
            </div>

            <div className={styles.price}>
                <div className={styles.label}>{_('price')}</div>
                <div className={styles.value}>
                    <div>1 {symbol1} = {price} {symbol2}</div>
                </div>
            </div>

            <Button type="primary" className={styles.btn} onClick={() => {
                this.setState({ page: 'result' })
            }}>{_('remove')}</Button>

        </div>
    }



    renderInfo() {
        const { symbol1, symbol2, removeToken1, removeToken2 } = this.state;
        return <div className={styles.my_pair_info}>
            <div className={styles.info_title_swap}>
                <div className={styles.info_title}>{_('your_re_liq')}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{symbol1}</div>
                <div className={styles.info_value}>{removeToken1}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{symbol2}</div>
                <div className={styles.info_value}>{removeToken2}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('earned')}</div>
                <div className={styles.info_value}>0.1BSV + 1.55 VUSD</div>
            </div>
        </div>
    }

    renderResult() {
        return <div className={styles.bd}>

            <div className={styles.finish_logo}><CheckCircleOutlined style={{ fontSize: 80, color: '#2BB696' }} /></div>
            <div className={styles.finish_title}>{_('liq_removed')}</div>
            <div className={styles.small_title}>{_('your_pos')}</div>

            <div className={styles.pair_box}>
                <div className={styles.pair_left}>
                    <div className={styles.icon}>
                        <CustomIcon type='iconlogo-bitcoin' />
                        <CustomIcon type='iconlogo-vusd' />
                    </div>
                    <div className={styles.name}>BSV/vUSD</div>
                </div>
                <div className={styles.pair_right}>0</div>
            </div>

            {this.renderInfo()}
            <Button type='primary' className={styles.done_btn} onClick={() => {
                this.props.history.push('pair');
            }}>{_('done')}</Button>
        </div>
    }

    render() {
        const { page } = this.state;
        return (<section className={styles.container}>
            <section className={styles.left}>
                <div className={styles.left_inner}>
                    <Header />
                    {this.renderContent()}
                </div>
            </section>
            <section className={styles.right}>
                <div className={styles.sidebar}>
                    <div className={styles.box}>
                        <div className={styles.hd}>
                            <div className={styles.hd_item} onClick={() => {
                                this.props.history.push('pool')
                            }}>Add</div>
                            <div className={styles.hd_item_cur}>Remove</div>
                        </div>
                        {page === 'form' ? this.renderForm() : this.renderResult()}
                    </div>
                </div>
            </section>
        </section>)
    }
}