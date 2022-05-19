import { Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import _ from 'i18n';
import { history } from 'umi';
import styles from './index.less';

const submenu = [
  {
    label: _('stake'),
    key: 'stake',
    path: 'stake',
  },
  {
    label: _('vote'),
    key: 'vote',
    path: 'vote',
  },
];

const hash = window.location.hash.substr(2);
let currentMenuIndex = 0;
submenu.forEach((item, index) => {
  if (hash.indexOf(item.key) > -1) {
    currentMenuIndex = index;
  }
});

function StakeSubmenu() {
  const gotoPage = (anchor) => {
    history.push(`/${anchor}`);
    // this.scrollto(anchor)
  };
  const menu = (
    <div className={styles.submenu}>
      {submenu.map((item, index) => {
        return (
          <div
            key={item.key}
            className={
              index === currentMenuIndex
                ? `${styles.submenu_item} ${styles.submenu_item_selected}`
                : styles.submenu_item
            }
            onClick={() => gotoPage(item.path)}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
  return (
    <Dropdown overlay={menu}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          {submenu[currentMenuIndex].label}
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
}

export default StakeSubmenu;
