'use strict';
import { Button } from 'antd';
import CustomIcon from 'components/icon';
import styles from './index.less';
import _ from 'i18n';

export function SuccessResult(props) {
  const { success_txt, done, children } = props;
  return (
    <>
      <div className={styles.finish_logo}>
        <CustomIcon
          type="iconicon-success"
          style={{ fontSize: 64, color: '#2BB696' }}
        />
      </div>
      <div className={styles.finish_title}>{success_txt}</div>

      {children}

      <Button
        type="primary"
        shape="round"
        className={styles.done_btn}
        onClick={done}
      >
        {_('done')}
      </Button>
    </>
  );
}
