'use strict';
import React from 'react';
import CustomIcon from 'components/icon';
import styles from './index.less';

const icons = {
  bsv: {
    type: 'iconlogo-bitcoin',
  },
  ba85ed5e6f4492e2789f92d8c66cbe211943bdfc: {
    //asc
    url: 'assets/asc.png',
  },
  ac42d90b83291e9c83d25bfe654cf83e0042b5a7: {
    //bart
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791ac42d90b83291e9c83d25bfe654cf83e0042b5a7.jpg',
  },
  '341476e63af470912dbd166b19cfb21429c32566': {
    //boex
    url: 'assets/boex.jpeg',
  },
  a0c26840c1a9f8bbad3c5e743efaf46e13623969: {
    //cc
    url: 'assets/cc.png',
  },
  f460d392aea8ee18a0e315588ff22ab8ca1c84b6: {
    //ceo
    url:
      'https://volt.oss-cn-hongkong.aliyuncs.com/coinlogo/777e4dd291059c9f7a0fd563f7204576dcceb791f460d392aea8ee18a0e315588ff22ab8ca1c84b6.jpg',
  },
  '54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3': {
    //mc
    type: 'icona-LogoMetaCoin',
  },
  '8e9c53e1a38ff28772db99ee34a23bb305062a1a': {
    //ovts
    url: 'assets/ovts.png',
  },
  '5d15eedd93c90d91e0d76de5cc932c833baf8336': {
    //tsc
    type: 'iconTS',
  },
  '67cfb6b1b163946a738cb0c2bed781d57d8099a7': {
    //usdt
    type: 'iconlogo-usdt',
  },
  '525d000031b3d45303cf96f3c38a890012d93040': {
    //whst
    url: 'assets/whst.jpeg',
  },
  test: {
    type: 'iconTS',
  },
  tbsv: {
    type: 'iconlogo-bitcoin',
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

  let { name, genesisID } = props;
  const icons_name = icons[genesisID];
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
  if (name) name = name.toLowerCase();
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
