import { PlusOutlined } from '@ant-design/icons';
import CustomIcon from 'components/icon';
import styles from './index.less';

export function Arrow(props) {
  const { noLine = false } = props;
  return (
    <div className={styles.arrow_icon}>
      <div className={styles.icon}>
        <CustomIcon type="iconArrow2" />
      </div>
      {!noLine && <div className={styles.line}></div>}
    </div>
  );
}

export function Arrow2(props) {
  return (
    <div className={styles.switch_icon}>
      <div className={styles.icon} onClick={props.onClick}>
        <CustomIcon type="iconswitch" style={{ fontSize: 20 }} />
      </div>
      <div className={styles.line}></div>
    </div>
  );
}

export function Plus() {
  return (
    <div className={styles.plus_icon}>
      <PlusOutlined style={{ fontSize: 18 }} />
    </div>
  );
}

export function Iconi() {
  return (
    <div className={styles.i_icon}>
      <CustomIcon type="iconi" />
    </div>
  );
}

export function IconTick() {
  return <CustomIcon type="iconcross-red" />;
}

export function IconX() {
  return <CustomIcon type="icontick-green" />;
}
