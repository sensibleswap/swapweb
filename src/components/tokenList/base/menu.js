import { jc } from 'common/utils';
import styles from './index.less';
import _ from 'i18n';

const listMenu = [_('curated_tokens'), _('unverified_zone')];

export default function Menu(props) {
  return (
    <div className={styles.menu}>
      {listMenu.map((menu, index) => (
        <span
          className={
            props.currentMenuIndex === index
              ? jc(styles.menu_item, styles.menu_item_selected)
              : styles.menu_item
          }
          onClick={() => props.changeMenu(index)}
          key={menu}
        >
          {menu}
        </span>
      ))}
    </div>
  );
}
