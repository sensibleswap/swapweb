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
    const { token1, token2, keyword, size = 30, txt, children } = this.props;

    const token1Name = token1.symbol.toUpperCase();
    const token2Name = token2.symbol.toUpperCase();

    // console.log(token1, token2)
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
        genesisID1={token1.tokenID}
        genesisID2={token2.tokenID}
        size={size}
      />
    );

    if (keyword === 'token1') {
      return (
        <>
          <div className="pair-icon">{token1Logo}</div>
          <div className="pair-name">
            {children} {token1Name}
          </div>
        </>
      );
    }
    if (keyword === 'token2') {
      return (
        <>
          <div className="pair-icon">{token2Logo}</div>
          <div className="pair-name">
            {children} {token2Name}
          </div>
        </>
      );
    }
    if (keyword === 'pair') {
      let str = `${token1Name}/${token2Name}`;
      if (txt) {
        str = txt.replace(/name1/g, token1Name);
        str = str.replace(/name2/g, token2Name);
      }
      return (
        <>
          <div className="pair-icon">{pairIcon}</div>
          <div className="pair-name">{str}</div>
        </>
      );
    }
    return null;
  }
}
