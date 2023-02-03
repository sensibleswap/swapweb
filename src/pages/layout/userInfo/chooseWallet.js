import { Modal } from 'antd';
import querystring from 'querystringify';
import CustomIcon from 'components/icon';
import sensiletIcon from '../../../../public/assets/sensilet.svg';
import styles from './index.less';
import _ from 'i18n';

const query = querystring.parse(window.location.search);
const isApp = query.env === 'webview' && window._volt_javascript_bridge;
const network = query.network == 'testnet' ? 'testnet' : 'mainnet';

export default function ChooseWallet(props) {
  const { closeChooseDialog, connectWebWallet } = props;
  return (
    <Modal
      title=""
      visible={true}
      footer={null}
      getContainer="#J_Page"
      className={styles.chooseLogin_dialog}
      width="400px"
      onCancel={closeChooseDialog}
      closable={false}
    >
      <div className={styles.title}>{_('connect_wallet')}</div>
      <ul>
        {!isApp && (
          <>
            <li onClick={() => connectWebWallet(5, network)}>
              <CustomIcon
                type="iconicon-volt-tokenswap-circle"
                style={{ fontSize: 30 }}
              />
              <div className={styles.label}>Volt {_('wallet')}</div>
            </li>
          </>
        )}

        <li onClick={() => connectWebWallet(2, network)}>
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
          </>
        )}
      </ul>
    </Modal>
  );
}
