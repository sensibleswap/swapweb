export const countLpAddAmount = function (
  token1AddAmount,
  swapToken1Amount,
  swapToken2Amount,
  swapLpTokenAmount,
) {
  token1AddAmount = BigInt(token1AddAmount);
  swapToken1Amount = BigInt(swapToken1Amount);
  swapToken2Amount = BigInt(swapToken2Amount);
  swapLpTokenAmount = BigInt(swapLpTokenAmount);
  let lpMinted = BigInt(0);
  let token2AddAmount = BigInt(0);
  if (swapLpTokenAmount > BigInt(0)) {
    lpMinted = (token1AddAmount * swapLpTokenAmount) / swapToken1Amount;
    token2AddAmount = (token1AddAmount * swapToken2Amount) / swapToken1Amount;
  } else {
    lpMinted = token1AddAmount;
  }
  // console.log(token1AddAmount, token2AddAmount, swapToken1Amount, swapToken2Amount);
  return [lpMinted, token2AddAmount];
};

// 增加流动性时使用token2计算token1以及lp token的增加数量
export const countLpAddAmountWithToken2 = function (
  token2AddAmount,
  swapToken1Amount,
  swapToken2Amount,
  swapLpTokenAmount,
) {
  token2AddAmount = BigInt(token2AddAmount);
  swapToken1Amount = BigInt(swapToken1Amount);
  swapToken2Amount = BigInt(swapToken2Amount);
  swapLpTokenAmount = BigInt(swapLpTokenAmount);
  let lpMinted = BigInt(0);
  let token1AddAmount = BigInt(0);
  if (swapLpTokenAmount > BigInt(0)) {
    token1AddAmount = (token2AddAmount * swapToken1Amount) / swapToken2Amount;
    lpMinted = (token1AddAmount * swapLpTokenAmount) / swapToken1Amount;
  } else {
    lpMinted = 0;
  }
  // console.log(token1AddAmount, token2AddAmount, swapToken1Amount, swapToken2Amount);
  return [lpMinted, token1AddAmount];
};
