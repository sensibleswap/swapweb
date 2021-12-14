import pairApi from '../api/pair';
import customApi from '../api/custom';
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

      p.push(
        data[item].custom
          ? customApi.querySwapInfo(tokenID)
          : pairApi.querySwapInfo(tokenID),
      );
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

export function handleFarmData(data, pairsData, tokenPrice) {
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

    let { symbol, decimal } = rewardToken;
    symbol = symbol.toUpperCase();
    if (!pairsData[token.tokenID]) {
      return null;
    }

    const {
      token1,
      token2,
      swapToken1Amount,
      swapToken2Amount,
      swapLpAmount,
    } = pairsData[token.tokenID];

    // const symbol1 = token1.symbol.toUpperCase();

    let reward_token;
    // if (symbol1 === 'BSV' || symbol1 === 'USDT') {
    //   reward_token = pairsData[`${symbol1}-${symbol}`];
    // } else if (symbol1 === 'TSC') {
    //   reward_token = pairsData[`USDT-TSC`];
    // } else if (symbol1 === 'TBSV' || symbol1 === 'TUSD') {
    //   reward_token = pairsData[`TBSV-${symbol}`];
    // }

    if (symbol === token2.symbol.toUpperCase()) {
      //用自己交易对池子数据
      reward_token = pairsData[token.tokenID];
    } else {
      reward_token = pairsData[`USDT-${symbol}`] || pairsData[`BSV-${symbol}`];
    }

    if (!reward_token) {
      allFarmData[id] = item;
      allFarmArr.push(item);
      return;
    }
    const token1_amount = formatSat(swapToken1Amount, token1.decimal);
    // const token2_amount = formatSat(swapToken2Amount, token2.decimal);

    const reward_token1_amount = formatSat(
      reward_token.swapToken1Amount,
      reward_token.token1.decimal,
    );
    const reward_token2_amount = formatSat(
      reward_token.swapToken2Amount,
      reward_token.token2.decimal,
    );
    // const _swapToken1Amount = formatSat(swapToken1Amount, token1.decimal);
    // const _swapToken2Amount = formatSat(swapToken2Amount, token2.decimal);
    // const token_price = BigNumber(_swapToken1Amount).div(_swapToken2Amount);

    // const bsv_amount = formatSat(reward_token.swapToken1Amount, reward_token.token1.decimal);

    // const lp_price = BigNumber(reward_token1_amount * 2).div(
    //   reward_token.swapLpAmount,
    // );
    const lp_price = BigNumber(token1_amount * 2).div(swapLpAmount);

    const token_price = BigNumber(reward_token1_amount).div(
      reward_token2_amount,
    );

    const reword_amount = formatSat(rewardAmountPerBlock, decimal);
    let _total = BigNumber(poolTokenAmount).multipliedBy(lp_price);
    // if(token1.symbol === 'SHOW') debugger
    // if(token1.symbol === 'SHOW') console.log( _total.toString());
    if (token2.symbol.toUpperCase() === 'USDT') {
      _total = formatSat(swapToken2Amount * 2, token2.decimal);
    } else if (
      token1.symbol !== 'bsv' &&
      reward_token.token1.symbol.toLowerCase() === 'bsv'
    ) {
      //先换算成bsv价格
      _total = _total.multipliedBy(token_price);
    }
    // if(token1.symbol === 'SHOW') console.log( _total.toString());

    let _yield = BigNumber(reword_amount)
      .multipliedBy(144)
      .multipliedBy(365)
      .multipliedBy(token_price)
      .div(_total)
      .multipliedBy(100);

    _yield = formatAmount(_yield, 2);

    if (reward_token.token1.symbol.toLowerCase() === 'bsv') {
      _total = _total.multipliedBy(tokenPrice.bsvPrice);
    } else if (reward_token.token1.symbol.toLowerCase() === 'tsc') {
      _total = _total.div(tokenPrice.tscPrice);
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
