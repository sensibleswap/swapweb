import CustomIcon from 'components/icon';
import styles from './index.less';

export default function Footer() {
  return (
    <section className={styles.footer}>
      <div className={styles.footer_inner}>
        <div className={styles.text_wrap}>
          <div className={styles.logo}>
            <CustomIcon type="iconTS_Logo" style={{ fontSize: 60 }} />
          </div>
          <div className={styles.text}>TokenSwap © 2021</div>
        </div>
        <div className={styles.icons}>
          {/*<a
            href="https://t.me/tswap_io"
            target="_blank"
            className={styles.icon}
          >
            <CustomIcon type="icontelegram" />
          </a>*/}
          <a
            href="https://twitter.com/tswap_io"
            target="_blank"
            className={styles.icon}
          >
            <CustomIcon type="iconTwitter" />
          </a>

          <a
            href="https://discord.gg/PyRHs2KaAh"
            target="_blank"
            className={styles.icon}
          >
            <CustomIcon type="icondiscord" />
          </a>

          <a
            href="https://github.com/sensibleswap/interface-doc/blob/master/swap_interface_en.md"
            target="_blank"
            className={styles.icon}
          >
            <CustomIcon type="icongithub" />
          </a>
        </div>
      </div>
    </section>
  );
}
