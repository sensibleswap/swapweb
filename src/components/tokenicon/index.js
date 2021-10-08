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
  tsc: {
    type: 'iconTS',
  },
  usdt: {
    type: 'iconlogo-usdt',
  },
  ovts: {
    url: 'assets/ovts.png',
  },
  test: {
    type: 'iconTS',
  },
  tbsv: {
    type: 'iconlogo-bitcoin',
  },
  bart: {
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791ac42d90b83291e9c83d25bfe654cf83e0042b5a7.jpg',
  },
  whst: {
    url: 'assets/whst.jpeg',
  },
  asc: {
    url: 'assets/asc.png',
  },
  ceo: {
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791f460d392aea8ee18a0e315588ff22ab8ca1c84b6.jpg',
  },
};

export default function TokenIcon(props) {
  const { icon, url, size = 40, style } = props;
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

  let name = props.name;
  if (name) name = name.toLowerCase();
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
