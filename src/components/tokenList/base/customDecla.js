import { Button } from 'antd';
import Cookie from 'js-cookie';
import styles from './index.less';
import _ from 'i18n';

const lang = Cookie.get('lang') || navigator.language;
const isZh = lang.toLowerCase() === 'zh-cn';

export default function CustomDecla(props) {
  return (
    <div className={styles.decla}>
      <div className={styles.dec_title}>{_('risks_dis')}</div>
      <p className={styles.dec_desc}>{_('risks_desc')}</p>
      <a
        href={
          isZh
            ? 'https://tokenswap.gitbook.io/tokenswap/v/zhong-wen/general-faq/feng-xian-ti-shi'
            : 'https://tokenswap.gitbook.io/tokenswap/risks'
        }
        target="_blank"
        className={styles.btn_link}
      >
        {_('risks_dis')}
      </a>
      <Button type="primary" className={styles.btn} onClick={props.agree}>
        {_('acknowlege')}
      </Button>
      <div className={styles.not} onClick={props.deny}>
        {_('not_acknowlege')}
      </div>
    </div>
  );
}
