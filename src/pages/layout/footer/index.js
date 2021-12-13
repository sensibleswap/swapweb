import CustomIcon from 'components/icon';
import styles from './index.less';

const linksData = [
  {
    url: 'https://twitter.com/tswap_io',
    icon: 'iconTwitter',
  },
  {
    url: 'https://discord.gg/PyRHs2KaAh',
    icon: 'icondiscord',
  },
  {
    url:
      'https://github.com/sensibleswap/interface-doc/blob/master/swap_interface_en.md',
    icon: 'icongithub',
  },
];

export default function Footer() {
  return (
    <section className={styles.footer}>
      <div className={styles.footer_inner}>
        <div className={styles.text_wrap}>
          <div className={styles.logo}>
            <CustomIcon type="iconTS_Logo" />
          </div>
          <div className={styles.text}>TokenSwap © 2021</div>
        </div>
        <div className={styles.icons}>
          {linksData.map((item) => (
            <a
              key={item.icon}
              href={item.url}
              target="_blank"
              className={styles.icon}
            >
              <CustomIcon type={item.icon} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
