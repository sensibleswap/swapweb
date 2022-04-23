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

function calcYield(rewardAmountPerBlock, decimal, token_price, _total) {
  const reword_amount = formatSat(rewardAmountPerBlock, decimal);

  let _yield = BigNumber(reword_amount)
    .multipliedBy(144)
    .multipliedBy(365)
    .multipliedBy(token_price)
    .div(_total)
    .multipliedBy(100);

  return formatAmount(_yield, 2);
}

function calcLPTotal(swapToken1Amount, token1, swapLpAmount, poolTokenAmount) {
  const token1_amount = formatSat(swapToken1Amount, token1.decimal);
  const lp_price = BigNumber(token1_amount * 2).div(swapLpAmount);
  const LPTotal = BigNumber(poolTokenAmount).multipliedBy(lp_price);
  return LPTotal;
}

function calcTokenPrice1(reward_token) {
  const reward_token1_amount = formatSat(
    reward_token.swapToken1Amount,
    reward_token.token1.decimal,
  );
  const reward_token2_amount = formatSat(
    reward_token.swapToken2Amount,
    reward_token.token2.decimal,
  );

  const token_price = BigNumber(reward_token1_amount).div(reward_token2_amount);
  return token_price;
}

function calcTokenPrice(reward_token) {
  const reward_token1_amount = formatSat(
    reward_token.swapToken1Amount,
    reward_token.token1.decimal,
  );
  const reward_token2_amount = formatSat(
    reward_token.swapToken2Amount,
    reward_token.token2.decimal,
  );

  const token_price = BigNumber(reward_token1_amount).div(reward_token2_amount);

  return token_price;
}

function calcTVL1(pairsData, data, id, tokenPrice, reward_token) {
  const { poolTokenAmount, rewardAmountPerBlock, rewardToken, token } = data[
    id
  ];

  const {
    token1,
    token2,
    swapToken1Amount,
    swapToken2Amount,
    swapLpAmount,
  } = pairsData[token.tokenID];

  const token1_symbol_lowerCase = token1.symbol.toLowerCase();
  const token2_symbol_lowerCase = token2.symbol.toLowerCase();
  const reward_token_symbol1_lowercase = reward_token.token1.symbol.toLowerCase();

  const token_price = calcTokenPrice(reward_token);

  let _total = calcLPTotal(
    swapToken1Amount,
    token1,
    swapLpAmount,
    poolTokenAmount,
  );

  if (token2_symbol_lowerCase === 'usdt') {
    _total = formatSat(swapToken2Amount * 2, token2.decimal);
  } else if (
    token1_symbol_lowerCase !== 'bsv' &&
    reward_token_symbol1_lowercase === 'bsv'
  ) {
    //先换算成bsv价格
    _total = BigNumber(_total).multipliedBy(token_price);
  }

  const _yield = calcYield(
    rewardAmountPerBlock,
    rewardToken.decimal,
    token_price,
    _total,
  );

  if (reward_token_symbol1_lowercase === 'bsv') {
    _total = BigNumber(_total).multipliedBy(tokenPrice.bsvPrice);
  } else if (reward_token_symbol1_lowercase === 'tsc') {
    _total = _total.div(tokenPrice.tscPrice);
  }
  return [_yield, _total];
}

function calcTVL(item, tokenPrice, reward_token, pairData, pairsData) {
  const { poolTokenAmount, rewardAmountPerBlock, rewardToken, token } = item;

  const {
    token1,
    token2,
    swapToken1Amount,
    swapToken2Amount,
    swapLpAmount,
  } = pairData;

  const token1_symbol_UpperCase = token1.symbol.toUpperCase();
  const token2_symbol_UpperCase = token2.symbol.toUpperCase();
  const reward_token_symbol1_upperCase = reward_token.lptoken.symbol
    .toUpperCase()
    .split('/')[0];

  let _lpToken = calcLPTotal(
    swapToken1Amount,
    token1,
    swapLpAmount,
    poolTokenAmount,
  );

  let token_price = calcTokenPrice(pairData); //当前池子里token2相对token1的价格
  let reward_token1_price = calcTokenPrice(reward_token); //奖励token的token2相对token1的价格
  const token_prices_usd = TokenPriceSummary(tokenPrice); //价格索引
  let token1_price = token_prices_usd[token1_symbol_UpperCase];
  const reward_token_price_usd = reward_token1_price.multipliedBy(
    token_prices_usd[reward_token_symbol1_upperCase],
  );
  // let reward_token2_price = token_prices_usd[reward_token_symbol1_upperCase];

  if (typeof token1_price === 'undefined') {
    const ref_pair_data =
      pairsData[`USDT-${token1_symbol_UpperCase}`] ||
      pairsData[`BSV-${token1_symbol_UpperCase}`];
    token1_price = calcTokenPrice(ref_pair_data).multipliedBy(
      token_prices_usd[ref_pair_data.token1.symbol.toUpperCase()],
    );

    _lpToken = calcLPTotal(
      ref_pair_data.swapToken1Amount,
      ref_pair_data.token1,
      ref_pair_data.swapLpAmount,
      poolTokenAmount,
    );
  }

  let _total = BigNumber(_lpToken).multipliedBy(token1_price);
  // console.log('token1_price',token1_price, 'reward_token1_price', reward_token2_price)
  // let _total;
  // if(token1_price) {
  //   _total = BigNumber(_lpToken).multipliedBy(token1_price);
  // }
  // else {
  //   _total = BigNumber(_lpToken).div(reward_token2_price);
  //   reward_token1_price = reward_token1_price.div(token1_prices[reward_token_symbol1_upperCase])
  // }
  // let _total = _lpToken;

  // if (token2_symbol_lowerCase === 'usdt') {
  //   _total = formatSat(swapToken2Amount * 2, token2.decimal);
  // } else if (
  //   token1_symbol_lowerCase !== 'bsv' &&
  //   reward_token_symbol1_lowercase === 'bsv'
  // ) {
  //   //先换算成bsv价格
  //   _total = BigNumber(_total).multipliedBy(token_price);
  // }

  const _yield = calcYield(
    rewardAmountPerBlock,
    rewardToken.decimal,
    reward_token_price_usd,
    _total,
  );

  // if (reward_token_symbol1_lowercase === 'bsv') {
  //   _total = BigNumber(_total).multipliedBy(tokenPrice.bsvPrice);
  // } else if (reward_token_symbol1_lowercase === 'tsc') {
  //   _total = _total.div(tokenPrice.tscPrice);
  // }
  return [_yield, _total];
}

const TokenPriceSummary = (tokenPrice) => {
  return {
    USDT: 1,
    BSV: tokenPrice.bsvPrice,
    TSC: 1 / tokenPrice.tscPrice,
  };
};

export function handleFarmData(data, pairsData, tokenPrice) {
  let allFarmData = {},
    allFarmArr = [];
  // console.log(data)
  Object.keys(data).forEach((id) => {
    if (id === 'blockHeight') return;
    let item = {
      ...data[id],
      id,
    };
    const { rewardToken, token } = data[id];

    const pairData = pairsData[token.tokenID];

    if (!pairData) {
      return null;
    }

    let { symbol } = rewardToken;
    symbol = symbol.toUpperCase();
    let reward_token;
    if (symbol === pairData.token2.symbol.toUpperCase()) {
      //用自己交易对池子数据
      reward_token = pairData;
    } else {
      reward_token = pairsData[`USDT-${symbol}`] || pairsData[`BSV-${symbol}`];
    }

    if (!reward_token) {
      allFarmData[id] = item;
      allFarmArr.push(item);
      return;
    }

    const [_yield, _total] = calcTVL(
      item,
      tokenPrice,
      reward_token,
      pairData,
      pairsData,
    );

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
