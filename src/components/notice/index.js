import { Alert } from 'antd';
import _ from 'i18n';

const VOLT_NOTICE_CLOSED = 'VoltNoticeClosed';
const { sessionStorage } = window;

const onClose = () => {
  sessionStorage.setItem(VOLT_NOTICE_CLOSED, 1);
};

export default function Notice(props) {
  // return null;
  if (sessionStorage.getItem(VOLT_NOTICE_CLOSED)) {
    return null;
  }
  return (
    <Alert
      type="success"
      banner={true}
      closable
      onClose={onClose}
      message={_('notice1117')}
    />
  );
}
