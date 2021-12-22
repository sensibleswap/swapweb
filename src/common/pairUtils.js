import BN from 'bignumber.js';
import { feeRate, FEE_FACTOR } from 'common/config';
import { formatAmount, formatTok } from 'common/utils';

export const calcAmount = (props) => {
  // if (!pairData) pairData = this.props.pairData;
  const {
    token1,
    token2,
    dirForward,
    originAddAmount = 0,
    aimAddAmount = 0,
    pairData,
  } = props;
  const { swapToken1Amount, swapToken2Amount, swapFeeRate } = pairData;
  let amount1 = dirForward ? swapToken1Amount : swapToken2Amount;
  let amount2 = dirForward ? swapToken2Amount : swapToken1Amount;
  let decimal1 = dirForward ? token1.decimal : token2.decimal;
  let decimal2 = dirForward ? token2.decimal : token1.decimal;

  let _originAddAmount = formatTok(originAddAmount, decimal1, false);

  let _aimAddAmount = formatTok(aimAddAmount, decimal2, false);
  let newAmount1 = BN(amount1),
    newAmount2 = BN(amount2);
  let newOriginAddAmount, newAimAddAmount, fee;
  if (originAddAmount > 0) {
    _originAddAmount = BigInt(_originAddAmount.toFixed(0));
    const addAmountWithFee =
      _originAddAmount * BigInt(FEE_FACTOR - swapFeeRate);
    newAmount1 = BigInt(amount1) + _originAddAmount;
    let removeAmount =
      (addAmountWithFee * BigInt(amount2)) /
      ((BigInt(amount1) + _originAddAmount) * BigInt(FEE_FACTOR));
    removeAmount = BN(removeAmount);
    newAmount2 = BN(amount2).minus(removeAmount);

    removeAmount = formatAmount(
      removeAmount.div(Math.pow(10, decimal2)),
      decimal2,
    );

    newOriginAddAmount = originAddAmount;
    newAimAddAmount = removeAmount;
  } else if (aimAddAmount > 0) {
    newAmount2 = BN(amount2).minus(_aimAddAmount);
    _aimAddAmount = BigInt(_aimAddAmount.toString());
    let addAmount =
      (_aimAddAmount * BigInt(FEE_FACTOR) * BigInt(amount1)) /
      (BigInt(FEE_FACTOR - swapFeeRate) * BigInt(amount2) -
        _aimAddAmount * BigInt(FEE_FACTOR));

    addAmount = BN(addAmount);
    newAmount1 = addAmount.plus(amount1);
    addAmount = addAmount.div(Math.pow(10, decimal1));
    let addAmountN = formatAmount(addAmount, decimal1);
    if (!addAmount.isGreaterThan(0)) {
      addAmountN = 0;
      newAmount1 = amount1;
      newAmount2 = BN(amount2);
    }

    newOriginAddAmount = addAmountN;
    newAimAddAmount = aimAddAmount;
    fee =
      addAmount > 0
        ? formatAmount(addAmount.multipliedBy(feeRate), decimal1)
        : 0;
  }
  // console.log('dirForward:', dirForward, 'amount1:', amount1, 'amount2:', amount2, 'newAmount1:', newAmount1.toString(), 'newAmount2:', newAmount2.toString());
  const p = dirForward
    ? BN(amount2).dividedBy(amount1)
    : BN(amount1).dividedBy(amount2);
  const p1 = dirForward
    ? newAmount2.dividedBy(newAmount1)
    : BN(newAmount1).dividedBy(newAmount2);
  const slip = p1.minus(p).dividedBy(p);

  return {
    newOriginAddAmount,
    newAimAddAmount,
    slip: slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
    fee,
  };
};
