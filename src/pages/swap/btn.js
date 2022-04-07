import { Button } from 'antd';
import BN from 'bignumber.js';
import { BtnWait } from 'components/btns';
import { formatSat } from 'common/utils';
import { MINAMOUNT } from 'common/config';
import styles from './index.less';
import _ from 'i18n';

export default function btn(props) {
  const {
    isLogin,
    pairData,
    token1,
    token2,
    accountInfo,
    // slip,
    beyond,
    lastMod,
    origin_amount,
    aim_amount,
    dirForward,
    // tol,
    handleSubmit,
  } = props;
  const { userBalance } = accountInfo;
  const { swapToken1Amount, swapToken2Amount } = pairData;
  const origin_token = dirForward ? token1 : token2;
  const aim_token = dirForward ? token2 : token1;
  const balance = userBalance[origin_token.tokenID || 'BSV'];

  // const beyond = parseFloat(slip) > parseFloat(tol);

  const conditions = [
    { key: 'login', cond: !isLogin },
    {
      cond: swapToken1Amount === '0' || swapToken2Amount === '0',
      txt: _('pair_init'),
    },
    {
      key: 'enterAmount',
      cond:
        !lastMod ||
        (parseFloat(origin_amount) <= 0 && parseFloat(aim_amount) <= 0),
    },
    {
      cond: BN(aim_amount)
        .multipliedBy(Math.pow(10, aim_token.decimal))
        .isGreaterThan(
          dirForward ? pairData.swapToken2Amount : pairData.swapToken1Amount,
        ),
      txt: _('not_enough', token2.symbol.toUpperCase()),
    },
    {
      key: 'lowerAmount',
      cond:
        origin_token.symbol === 'bsv' &&
        parseFloat(origin_amount) <= formatSat(MINAMOUNT),
    },
    {
      key: 'lackBalance',
      cond: parseFloat(origin_amount) > parseFloat(balance || 0),
      txtParam: origin_token.symbol,
    },
  ];

  let _btn = BtnWait(conditions);
  if (_btn) {
    return _btn;
  }
  if (beyond) {
    // 超出容忍度
    return (
      <Button className={styles.btn_warn} shape="round" onClick={handleSubmit}>
        {_('swap_anyway')}
      </Button>
    );
  } else {
    return (
      <Button
        className={styles.btn}
        type="primary"
        shape="round"
        onClick={handleSubmit}
      >
        {_('swap')}
      </Button>
    );
  }
}
