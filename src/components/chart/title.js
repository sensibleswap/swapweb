'use strict';
import { Dropdown } from 'antd';
import CustomIcon from 'components/icon';
import TokenList from 'components/tokenList';
import styles from './index.less';
import _ from 'i18n';

export default function chartTitle(props) {
  const { symbol1, symbol2, type } = props;
  return (
    <Dropdown
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
          style={{ fontSize: 20, marginLeft: 40 }}
        />
      </span>
    </Dropdown>
  );
}
