'use strict';
import React from 'react';
import CustomIcon from 'components/icon';
import styles from './index.less';

const icons = {
  bsv: {
    type: 'iconlogo-bitcoin',
  },
  mc: {
    type: 'icona-LogoMetaCoin',
  },
  boex: {
    url: 'assets/boex.jpeg',
  },
  ovts: {
    url: 'assets/ovts.png',
  },
};

export default function TokenIcon(props) {
  const { icon, url, size = 40, style } = props;
  let name = props.name.toLowerCase();
  if (icon) {
    return <CustomIcon type={icon} style={{ fontSize: size, ...style }} />;
  }

  if (url) {
    return (
      <img
        src={url}
        style={{ width: size, height: size, ...style, borderRadius: 20 }}
      />
    );
  }

  const icons_name = icons[name];
  if (icons_name) {
    if (icons_name.type) {
      return (
        <CustomIcon
          type={icons_name.type}
          style={{
            fontSize: size,
            ...style,
            backgroundColor: '#fff',
            borderRadius: '50%',
          }}
        />
      );
    } else if (icons_name.url) {
      return (
        <img
          src={icons_name.url}
          style={{ width: size, height: size, ...style, borderRadius: 20 }}
        />
      );
    }
  }

  if (!name) {
    return null;
  }
  const letter = name.substr(0, 1).toUpperCase();
  return (
    <div
      className={styles.logo}
      style={{
        fontSize: size * 0.84,
        width: size,
        height: size,
        lineHeight: `${size}px`,
        ...style,
      }}
    >
      {letter}
    </div>
  );
}
