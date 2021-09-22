'use strict';
import { Dropdown } from 'antd';
import CustomIcon from 'components/icon';
import TokenList from 'components/tokenList';
import TimeRangeTabs from './timeRangeTabs';
import styles from './index.less';
import _ from 'i18n';

export default function chartTitle(props) {
  const { symbol1, symbol2, type } = props;
  return (
    <div className={styles.chart_heading}>
      <Dropdown
        trigger={['click']}
        overlay={<TokenList size="small" />}
        overlayClassName={styles.drop_menu}
      >
        <span className={styles.chart_title}>
          {symbol2 === 'USDT' ? (
            <>
              <span>{symbol1}</span>/{symbol2}
            </>
          ) : (
            <>
              <span>{symbol2}</span>/{symbol1}
            </>
          )}
          <CustomIcon
            type="iconDropdown"
            style={{ fontSize: 20, marginLeft: 15 }}
          />
        </span>
      </Dropdown>

      <div className={styles.time_picker_top}>
        <TimeRangeTabs type={type} />
      </div>
    </div>
  );
}
