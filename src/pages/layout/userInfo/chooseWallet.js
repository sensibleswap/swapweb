import { Modal } from 'antd';
import querystring from 'querystringify';
import CustomIcon from 'components/icon';
import sensiletIcon from '../../../../public/assets/sensilet.svg';
import styles from './index.less';
import _ from 'i18n';

const query = querystring.parse(window.location.search);
const isApp = query.env === 'webview' && window._volt_javascript_bridge;

export default function ChooseWallet(props) {
  const { closeChooseDialog, connectWebWallet } = props;
  return (
    <Modal
      title=""
      visible={true}
      footer={null}
      className={styles.chooseLogin_dialog}
      width="400px"
      onCancel={closeChooseDialog}
      closable={false}
    >
      <div className={styles.title}>{_('connect_wallet')}</div>
      <ul>
        {!isApp && (
          <>
            <li onClick={() => connectWebWallet(5, 'mainnet')}>
              <CustomIcon
                type="iconicon-volt-tokenswap-circle"
                style={{ fontSize: 30 }}
              />
              <div className={styles.label}>Volt {_('wallet')}</div>
            </li>
          </>
        )}

        <li onClick={() => connectWebWallet(2, 'mainnet')}>
          <CustomIcon type="iconicon-volt-tokenswap-circle" />
          <div className={styles.label}>Volt Web {_('wallet')}</div>
        </li>

        {!isApp && (
          <>
            <li onClick={() => connectWebWallet(4, 'mainnet')}>
              <div className={styles.sens_icon}>
                <img src={sensiletIcon} />
              </div>
              <div className={styles.label}>Sensilet</div>
            </li>
            <li onClick={() => connectWebWallet(2, 'testnet')}>
              <CustomIcon type="iconBSVtestnet" />
              <div className={styles.label}>BSV Testnet</div>
            </li>
            <li onClick={() => connectWebWallet(1)} style={{ fontSize: 15 }}>
              <div className={styles.ts_icon}>
                <CustomIcon type="iconTS_Logo" style={{ fontSize: 20 }} />
              </div>
              <div className={styles.label}>
                TS {_('wallet')}
                <div className={styles.sub}>{_('test_only')}</div>
              </div>
            </li>
          </>
        )}
      </ul>
    </Modal>
  );
}
