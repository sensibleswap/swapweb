import React from 'react';
import { connect } from 'umi';
import TokenLogo from 'components/tokenicon';
import TokenPair from 'components/tokenPair';

@connect(({ pair, loading }) => {
  const { effects } = loading;
  return {
    ...pair,
    loading: effects['pair/getAllPairs'],
  };
})
export default class PairIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.loading) return null;
    const { token1, token2, keyword, size = 30 } = this.props;

    const token1Name = token1.symbol.toUpperCase();
    const token2Name = token2.symbol.toUpperCase();

    const token1Logo = (
      <TokenLogo
        name={token1.symbol}
        genesisID={token1.tokenID || 'bsv'}
        size={size}
      />
    );
    const token2Logo = (
      <TokenLogo
        name={token2.symbol}
        genesisID={token2.tokenID || 'bsv'}
        size={size}
      />
    );

    const pairIcon = (
      <TokenPair
        symbol1={token1Name}
        symbol2={token2Name}
        genesisID1={token1.tokenID || 'bsv'}
        genesisID2={token2.tokenID}
        size={size}
      />
    );

    if (keyword === 'token1name') {
      return token1Name;
    }
    if (keyword === 'token2name') {
      return token2Name;
    }
    if (keyword === 'token1icon') {
      return token1Logo;
    }
    if (keyword === 'token2icon') {
      return token2Logo;
    }
    if (keyword === 'pairIcon') {
      return pairIcon;
    }

    if (keyword === 'name1name2') {
      return `${token1Name}/${token2Name}`;
    }
    if (keyword === 'name2name1') {
      return `${token2Name}/${token1Name}`;
    }

    if (keyword === 'token1') {
      return (
        <>
          {token1Logo} <div className="pair-name">{token1Name}</div>
        </>
      );
    }
    if (keyword === 'token2') {
      return (
        <>
          {token2Logo} <div className="pair-name">{token2Name}</div>
        </>
      );
    }
    if (keyword === 'pair') {
      return (
        <>
          {pairIcon}{' '}
          <div className="pair-name">
            {token1Name}/{token2Name}
          </div>
        </>
      );
    }
    return null;
  }
}
