'use strict';
import { COLOR1 } from 'common/const';
import Chart from './index';
import ChartTitle from './title';
import styles from './index.less';
import _ from 'i18n';

const type = 'pool';
export default function PoolChart(props) {
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
          TVL
        </div>
      </div>
      <Chart type={type} />
    </div>
  );
}
