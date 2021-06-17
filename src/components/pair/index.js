
import React from 'react';
// import CustomIcon from 'components/icon';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {formatSat, formatAmount} from 'common/utils';
import styles from './index.less';
import _ from 'i18n';
import BigNumber from 'bignumber.js';


export default function Pair(props) {
        const {pairData, curPair, LP} = props;
        const {swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;
        const rate = LP/swapLpAmount;
        const token1 = formatAmount(formatSat(swapToken1Amount, curPair.token1.decimal || 8));
        const token2 = formatAmount(formatSat(swapToken2Amount, curPair.token2.decimal));
        const _rate = (rate*100).toFixed(2);
       
    return <div className={styles.container}>
        <div className={styles.item}>
            <div className={styles.title} style={{ display: 'flex' }}>
                <div className={styles.name}>{_('pool_share')}</div>
                <div className={styles.help}><QuestionCircleOutlined /></div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>LP {_('tokens')}</div>
                <div className={styles.info_value}>{LP}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('pooled')} BSV</div>
                <div className={styles.info_value}>{token1}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('pooled')} vUSD</div>
                <div className={styles.info_value}>{token2}</div>
            </div>
            <div className={styles.info_item}>
                <div className={styles.info_label}>{_('your_share')}</div>
                <div className={styles.info_value}>{_rate}%</div>
            </div>
        </div>
    </div>
}