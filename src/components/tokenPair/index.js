import TokenIcon from '../tokenicon';
import styles from './index.less';

export default function TokenIcons(props) {
  const { symbol1, symbol2, size, style } = props;
  return (
    <div className={styles.icons} style={style}>
      <TokenIcon name={symbol1} size={size} style={{ zIndex: 1 }} />
      <TokenIcon
        name={symbol2}
        size={size}
        style={{ size, marginLeft: `-${size / 2}px` }}
      />
    </div>
  );
}
