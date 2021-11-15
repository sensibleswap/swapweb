import BigNumber from 'bignumber.js';
import { formatSat, formatAmount, tokenPre } from './utils';

export function handleFarmData(data, allPairs, pairsData, bsvPrice) {
  let allFarmData = {},
    allFarmArr = [];
  Object.keys(data).forEach((pairName) => {
    if (pairName === 'blockHeight') return;
    let item = data[pairName];
    item.pairName = pairName;
    const { poolTokenAmount, rewardAmountPerBlock, rewardToken } = data[
      pairName
    ];
    const { token1 } = allPairs[pairName];
    const [symbol1] = pairName.toUpperCase().split('-');

    let { decimal, symbol } = rewardToken;
    symbol = symbol.toLowerCase();
    const { swapLpAmount = 0, swapToken1Amount = 0 } = pairsData[pairName];

    const bsv_amount = formatSat(swapToken1Amount, token1.decimal);

    const lp_price = BigNumber(bsv_amount * 2).div(swapLpAmount);

    let reward_token;
    if (pairName.indexOf('bsv-') === 0) {
      reward_token = pairsData[`bsv-${symbol}`];
    } else if (pairName.indexOf('usdt-') === 0) {
      reward_token = pairsData[`usdt-${symbol}`];
    } else if (pairName.indexOf('tsc-') === 0) {
      reward_token = pairsData[`usdt-tsc`];
    } else if (pairName.indexOf('tbsv-') === 0) {
      reward_token = pairsData[`tbsv-${symbol}`];
    }
    // const reward_symbol = `${tokenPre()}${symbol.toLowerCase()}`;
    // let reward_token = pairsData[reward_symbol];

    // if (pairName === 'usdt-tsc') {
    //   reward_token = pairsData[pairName];
    // }
    if (!reward_token || !allPairs[pairName]) {
      allFarmData[pairName] = item;
      allFarmArr.push(item);
      return;
    }

    const reward_bsv_amount = formatSat(
      reward_token.swapToken1Amount,
      token1.decimal,
    );
    const reward_token_amount = formatSat(
      reward_token.swapToken2Amount,
      decimal,
    );
    const token_price = BigNumber(reward_bsv_amount).div(reward_token_amount);

    const reword_amount = formatSat(rewardAmountPerBlock, decimal);
    let _total = BigNumber(poolTokenAmount).multipliedBy(lp_price);

    let _yield = BigNumber(reword_amount)
      .multipliedBy(144)
      .multipliedBy(365)
      .multipliedBy(token_price)
      .div(_total)
      .multipliedBy(100);

    _yield = formatAmount(_yield, 2);

    if (symbol1 === 'BSV') {
      _total = _total.multipliedBy(bsvPrice);
    }
    item._yield = _yield;
    item._total = _total;

    allFarmData[pairName] = item;
    allFarmArr.push(item);
  });
  allFarmArr.sort((a, b) => {
    return b._total.toString() - a._total.toString();
  });
  return { allFarmData, allFarmArr };
}
