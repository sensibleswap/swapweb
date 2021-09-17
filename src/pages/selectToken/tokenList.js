'use strict';
import querystring from 'querystringify';
import { CheckCircleOutlined } from '@ant-design/icons';
import TokenPair from 'components/tokenPair';
import styles from './index.less';
import _ from 'i18n';

const query = querystring.parse(window.location.search);

export default function TokenList(props) {
  const { currentPair, showList, switchToken } = props;
  return (
    <div className={styles.token_list}>
      {showList &&
        showList.map((item, index) => {
          if ((item.test && query.env === 'local') || !item.test) {
            return (
              <div
                className={styles.item}
                key={item.name + index}
                onClick={() => {
                  switchToken(item.name);
                }}
              >
                <div className={styles.icon}>
                  <TokenPair
                    symbol1={item.token1.symbol}
                    symbol2={item.token2.symbol}
                    size={25}
                  />
                </div>
                <div className={styles.title}>
                  <div className={styles.name}>{item.name.toUpperCase()}</div>
                </div>
                <div className={styles.selected}>
                  {item.name === currentPair && (
                    <CheckCircleOutlined
                      theme="filled"
                      style={{ color: '#2F80ED', fontSize: 30 }}
                    />
                  )}
                </div>
              </div>
            );
          }
        })}
    </div>
  );
}
