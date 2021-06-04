import BigNumber from 'bignumber.js';

const FEE_FACTOR = 10000;
const MIN_TOKEN1_FEE = 600;

// 增加流动性时使用token1计算token2以及lp token的增加数量
export const countLpAddAmount = function(token1AddAmount, pairData) {
  const { swapToken1Amount, swapToken2Amount, swapLpAmount } = pairData;
  let lpMinted = BigNumber(0);
  let token2AddAmount = BigNumber(0);
  if (swapLpAmount > 0) {
    lpMinted = BigNumber(token1AddAmount).multipliedBy(swapLpAmount).div(swapToken1Amount).toNumber();
    token2AddAmount = BigNumber(token1AddAmount).multipliedBy(swapToken2Amount).div(swapToken1Amount).plus(1).toNumber()
  } else {
    lpMinted = token1AddAmount
    token2AddAmount = token2AddAmount.toNumber()
  }
  return {lpMinted, token2AddAmount}
}

// 增加流动性时使用token2计算token1以及lp token的增加数量
export const countLpAddAmountWithToken2 = function(token2AddAmount, swapToken1Amount, swapToken2Amount, swapLpTokenAmount) {
  token2AddAmount = BigInt(token2AddAmount)
  swapToken1Amount = BigInt(swapToken1Amount)
  swapToken2Amount = BigInt(swapToken2Amount)
  swapLpTokenAmount = BigInt(swapLpTokenAmount)
  let lpMinted = 0n
  //let token1AddAmount = 0n
  if (swapLpTokenAmount > 0n) {
    token1AddAmount = token2AddAmount * swapToken1Amount / swapToken2Amount
    lpMinted = token1AddAmount * swapLpTokenAmount / swapToken1Amount
  } else {
    lpMinted = 0
  }
  return [lpMinted, token1AddAmount]
}

// 提取流动性时使用提取的lp token数量来计算可获得的token1和token2数量
export const countLpRemoveAmount = function(lpTokenRemoveAmount, swapToken1Amount, swapToken2Amount, swapLpTokenAmount) {
  lpTokenRemoveAmount = BigInt(lpTokenRemoveAmount)
  swapToken1Amount = BigInt(swapToken1Amount)
  swapToken2Amount = BigInt(swapToken2Amount)
  swapLpTokenAmount = BigInt(swapLpTokenAmount)
  const token1RemoveAmount = lpTokenRemoveAmount * swapToken1Amount / swapLpTokenAmount
  const token2RemoveAmount = lpTokenRemoveAmount * swapToken2Amount / swapLpTokenAmount
  return [token1RemoveAmount, token2RemoveAmount]
}


// 交换token1到token2时可获取的token2数量
export const swapToken1ToToken2 = function(token1AddAmount, pairData) {
    const {swapToken1Amount, swapToken2Amount, swapFeeRate, projFeeRate} = pairData;
    
    const token1AddAmountWithFee = BigNumber(token1AddAmount).multipliedBy(FEE_FACTOR - swapFeeRate);
    const token2RemoveAmount = token1AddAmountWithFee.multipliedBy(swapToken2Amount).div(BigNumber(swapToken1Amount).multipliedBy(FEE_FACTOR).plus(token1AddAmountWithFee)).toNumber();
  
    let projFee = BigNumber(token1AddAmount).multipliedBy(projFeeRate).div(FEE_FACTOR).toNumber();
    console.log(projFee);
    if (projFee < MIN_TOKEN1_FEE) {
      projFee = 0;
    }
    return {token2RemoveAmount, projFee};
  }

// 交换token2到token1时可获取的token2数量
export const swapToken2ToToken1 = function(token2AddAmount, pairData) {
    const {swapToken1Amount, swapToken2Amount, swapFeeRate, projFeeRate} = pairData;
  
  const token2AddAmountWithFee = BigNumber(token2AddAmount).multipliedBy(FEE_FACTOR - swapFeeRate);
  const token1RemoveAmount = token2AddAmountWithFee.multipliedBy(swapToken1Amount).div(BigNumber(swapToken1Amount).multipliedBy(FEE_FACTOR).plus(token2AddAmountWithFee)).toNumber();

  let projFee = BigNumber(token2AddAmount).multipliedBy(swapToken1Amount).multipliedBy(projFeeRate).div(BigNumber(swapToken2Amount).multipliedBy(FEE_FACTOR).plus(token2AddAmountWithFee)).toNumber();
  if (projFee < MIN_TOKEN1_FEE) {
    projFee = 0;
  }
  return {token1RemoveAmount, projFee};
}