import React from 'react';
import { connect } from 'umi';
import TokenPair from 'components/tokenPair';

@connect(({ pair, farm }) => {
  return {
    ...pair,
    ...farm,
  };
})
export default class FarmPairIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { allPairs, currentFarmPair, keyword, size = 25 } = this.props;
    const { token1, token2 } = allPairs[currentFarmPair];
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();

    if (keyword === 'pair') {
      return (
        <>
          <div className="pair-icon">
            <TokenPair
              symbol1={symbol1}
              symbol2={symbol2}
              size={size}
              genesisID2={token2.tokenID}
              genesisID1={token1.tokenID}
            />
          </div>
          <div className="pair-name">
            {symbol1}/{symbol2}-LP
          </div>
        </>
      );
    }
    // if (keyword === 'pair2') {
    //   return (
    //     <>
    //       <div className="pair-icon">
    //         <TokenPair
    //           symbol1={symbol2}
    //           symbol2={symbol1}
    //           size={size}
    //           genesisID2={token1.tokenID}
    //           genesisID1={token2.tokenID}
    //         />
    //       </div>
    //       <div className="pair-name">
    //         {symbol2}/{symbol1}-LP
    //       </div>
    //     </>
    //   );
    // }

    return null;
  }
}
