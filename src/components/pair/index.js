import React from 'react';
// import CustomIcon from 'components/icon';
// import { QuestionCircleOutlined } from '@ant-design/icons';
import { formatSat, formatAmount } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';
// import BigNumber from 'bignumber.js';

export default function Pair(props) {
  const { pairData, curPair, userBalance } = props;
  const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;
  const { lptoken = {}, token1, token2 } = curPair;
  const LP = userBalance[lptoken.tokenID] || 0;
  const rate = LP / formatSat(swapLpAmount, lptoken.decimal) || 0;
  const _token1 = formatAmount(formatSat(swapToken1Amount, token1.decimal), 8);
  const _token2 = formatAmount(formatSat(swapToken2Amount, token2.decimal), 8);
  const _rate = (rate * 100).toFixed(4);
  const symbol1 = token1.symbol.toUpperCase();
  const symbol2 = token2.symbol.toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.title} style={{ display: 'flex' }}>
          <div className={styles.name}>{_('pool_share')}</div>
        </div>
        <div className={styles.info_item}>
          <div className={styles.info_label}>{_('pooled', symbol1)}</div>
          <div className={styles.info_value}>{_token1}</div>
        </div>
        <div className={styles.info_item}>
          <div className={styles.info_label}>{_('pooled', symbol2)}</div>
          <div className={styles.info_value}>{_token2}</div>
        </div>
        <div className={styles.info_item}>
          <div className={styles.info_label}>
            {_('your_lp', `${symbol1}/${symbol2}`)}
          </div>
          <div className={styles.info_value}>{LP}</div>
        </div>
        <div className={styles.info_item}>
          <div className={styles.info_label}>
            {_('total_lp', `${symbol1}/${symbol2}`)}
          </div>
          <div className={styles.info_value}>
            {formatSat(swapLpAmount, lptoken.decimal)}
          </div>
        </div>
        <div className={styles.info_item}>
          <div className={styles.info_label}>{_('your_share')}</div>
          <div className={styles.info_value}>{_rate}%</div>
        </div>
      </div>
    </div>
  );
}
