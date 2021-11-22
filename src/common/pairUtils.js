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
  // let _originAddAmount = BN(originAddAmount).multipliedBy(
  //     Math.pow(10, decimal1),
  // );
  let _originAddAmount = formatTok(originAddAmount, decimal1, false);
  // let _aimAddAmount = BN(aimAddAmount).multipliedBy(
  //     Math.pow(10, decimal2),
  // );
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

    // this.formRef.current.setFieldsValue({
    //     aim_amount: removeAmount,
    // });
    // this.setState({
    //     aim_amount: removeAmount,
    // });
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
    addAmount = addAmount.div(Math.pow(10, decimal1));
    newAmount1 = addAmount.plus(amount1);
    let addAmountN = formatAmount(addAmount, decimal1);
    if (!addAmount.isGreaterThan(0)) {
      addAmountN = 0;
      newAmount1 = amount1;
      newAmount2 = BN(amount2);
    }

    // this.formRef.current.setFieldsValue({
    //     origin_amount: addAmountN,
    // });
    // this.setState({
    //     origin_amount: addAmountN,
    //     fee:
    //         addAmount > 0
    //             ? formatAmount(addAmount.multipliedBy(feeRate), decimal1)
    //             : 0,
    // });
    newOriginAddAmount = addAmountN;
    newAimAddAmount = aimAddAmount;
    fee =
      addAmount > 0
        ? formatAmount(addAmount.multipliedBy(feeRate), decimal1)
        : 0;
  } else {
    //两个值都没有大于0
    // this.formRef.current.setFieldsValue({
    //     origin_amount: originAddAmount,
    //     aim_amount: aimAddAmount,
    // });
    // this.setState({
    //     origin_amount: originAddAmount,
    //     aim_amount: aimAddAmount,
    // });
    newOriginAddAmount = originAddAmount;
    newAimAddAmount = aimAddAmount;
  }

  const p = BN(amount2).dividedBy(amount1);
  const p1 = newAmount2.dividedBy(newAmount1);
  const slip = p1.minus(p).dividedBy(p);

  // this.setState({
  //     slip: slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
  // });
  return {
    newOriginAddAmount,
    newAimAddAmount,
    slip: slip.multipliedBy(100).abs().toFixed(2).toString() + '%',
    fee,
  };
};
