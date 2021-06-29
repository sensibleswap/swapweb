'use strict';
import React from 'react';
import TokenLogo from 'components/tokenicon';
import { formatSat } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';

export default function PairStat(props) {
  const {
    totalLiquidity = {},
    volume = {},
    fees = {},
    swapToken1Amount,
    swapToken2Amount,
    token1,
    token2,
  } = props.pairData || {};

  const amount1 = formatSat(swapToken1Amount, token1.decimal);
  const amount2 = formatSat(swapToken2Amount, token2.decimal);
  return (
    <div className={styles.container}>
      {/*<div className={styles.item}>
            <div className={styles.label}>{_('total_liq')}</div>
            <div className={styles.value_wrap}>
                <div className={styles.value}>${totalLiquidity.totalAmount}</div>
                <div className={styles.percent} style={{ color: '#EB5757' }}>{totalLiquidity.changeRate}</div>
            </div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>{_('volume')}(24{_('hrs')})</div>
            <div className={styles.value_wrap}>
                <div className={styles.value}>${volume.amount}</div>
                <div className={styles.percent}>{volume.changeRate}</div>
            </div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>{_('fees')}(24{_('hrs')})</div>
            <div className={styles.value_wrap}>
                <div className={styles.value}>${fees.amount}</div>
                <div className={styles.percent} style={{ color: '#229278' }}>+{fees.changeRate}</div>
            </div>
</div>*/}
      <div className={styles.item}>
        <div className={styles.label}>{_('pooled_tokens')}</div>

        <div className={styles.value2} key={token1.tokenid}>
          <TokenLogo
            name={token1.symbol}
            size={30}
            style={{ marginRight: 10 }}
          />{' '}
          {amount1} {token1.symbol.toUpperCase()}
        </div>
        <div className={styles.value2} key={token2.tokenid}>
          <TokenLogo
            name={token2.symbol}
            size={30}
            style={{ marginRight: 10 }}
          />{' '}
          {amount2} {token2.symbol.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
