'use strict';
import { Dropdown } from 'antd';
import CustomIcon from 'components/icon';
import TokenList from 'components/tokenList';
import TimeRangeTabs from './timeRangeTabs';
import styles from './index.less';
import _ from 'i18n';

export default function chartTitle(props) {
  let { symbol1, symbol2, type, abandoned } = props;
  symbol1 = symbol1.toUpperCase();
  symbol2 = symbol2.toUpperCase();
  return (
    <div className={styles.chart_heading}>
      <Dropdown
        trigger={['click']}
        overlay={<TokenList size="small" type="pair" />}
        overlayClassName={styles.drop_menu}
        overlayStyle={{ width: 350 }}
        getPopupContainer={() => document.getElementById('J_Page')}
      >
        <span className={styles.chart_title}>
          {symbol2 === 'USDT' ? (
            <>
              <span>{symbol1}</span>/{symbol2}
              {abandoned && '(old)'}
            </>
          ) : (
            <>
              <span>{symbol2}</span>/{symbol1}
              {abandoned && '(old)'}
            </>
          )}
          <CustomIcon type="iconDropdown" />
        </span>
      </Dropdown>

      <div className={styles.time_picker_top}>
        <TimeRangeTabs type={type} />
      </div>
    </div>
  );
}
