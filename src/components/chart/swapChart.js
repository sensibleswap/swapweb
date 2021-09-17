'use strict';
import { COLOR1, COLOR2 } from 'common/const';
import Chart from './index';
import ChartTitle from './title';
import styles from './index.less';
import _ from 'i18n';

const type = 'swap';
export default function SwapChart(props) {
  const { symbol1, symbol2 } = props;
  return (
    <div className={styles.chart_container}>
      <ChartTitle type={type} symbol1={symbol1} symbol2={symbol2} />

      <div className={styles.data_info}>
        <div>
          <span
            className={styles.dot}
            style={{ backgroundColor: COLOR1 }}
          ></span>{' '}
          {_('price')}
        </div>
        <div>
          <span
            className={styles.dot}
            style={{ backgroundColor: COLOR2 }}
          ></span>{' '}
          {_('volume')}
        </div>
      </div>
      <Chart type={type} />
    </div>
  );
}
