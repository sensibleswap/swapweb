import pairApi from '../api/pair';
import BigNumber from 'bignumber.js';
import { formatSat, formatAmount } from './utils';

export async function fetchFarmData(data) {
  let p = [];
  let pairsData = {};
  let pairs = [];

  Object.keys(data).forEach((item) => {
    if (item !== 'blockHeight') {
      let { tokenID } = data[item].token;
      pairs.push(tokenID);

      p.push(pairApi.querySwapInfo(tokenID));
    }
  });
  const datas_res = await Promise.all(p);

  // console.log(pairs, datas_res)
  pairs.forEach((item, index) => {
    if (datas_res[index].code === 0) {
      let d = datas_res[index].data;
      pairsData[item] = d;
      const { token1, token2 } = d;
      pairsData[`${token1.symbol}-${token2.symbol}`.toUpperCase()] = d; //加个交易名索引，用来快速获取奖励token的数据
    }
  });
  return pairsData;
}

export function handleFarmData(data, pairsData, bsvPrice) {
  let allFarmData = {},
    allFarmArr = [];
  // console.log(data)
  Object.keys(data).forEach((id) => {
    if (id === 'blockHeight') return;
    let item = data[id];
    const { poolTokenAmount, rewardAmountPerBlock, rewardToken, token } = data[
      id
    ];

    item.id = id;
    // console.log(id);

    let { decimal, symbol } = rewardToken;
    symbol = symbol.toUpperCase();

    const { swapLpAmount = 0, swapToken1Amount = 0, token1 } = pairsData[
      token.tokenID
    ];

    const bsv_amount = formatSat(swapToken1Amount, token1.decimal);

    const lp_price = BigNumber(bsv_amount * 2).div(swapLpAmount);

    const symbol1 = token1.symbol.toUpperCase();

    let reward_token;
    if (symbol1 === 'BSV' || symbol1 === 'USDT') {
      reward_token = pairsData[`${symbol1}-${symbol}`];
    } else if (symbol1 === 'TSC') {
      reward_token = pairsData[`USDT-TSC`];
    } else if (symbol1 === 'TBSV' || symbol1 === 'TUSD') {
      reward_token = pairsData[`TBSV-${symbol}`];
    }

    if (!reward_token) {
      allFarmData[id] = item;
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

    if (token1.symbol === 'bsv') {
      _total = _total.multipliedBy(bsvPrice);
    }
    item._yield = _yield;
    item._total = _total.toString();

    allFarmData[id] = item;
    allFarmArr.push(item);
  });
  allFarmArr.sort((a, b) => {
    return b._total - a._total;
  });
  return { allFarmData, allFarmArr };
}
