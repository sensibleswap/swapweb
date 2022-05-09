import { useEffect, useState, messsage } from 'react';
import { connect, useDispatch } from 'umi';
import { formatSat } from 'common/utils';
import Loading from 'components/loading';
import TokenLogo from 'components/tokenicon';
import FormatNumber from 'components/formatNumber';
import styles from './index.less';
import _ from 'i18n';
import HarvestBtn from './harvest';
import WithdrawBtn from './withdraw';

function Content(props) {
  // console.log(props)
  // const { dispatch } = props;
  const dispatch = useDispatch();
  const { pairData, stakePairInfo, accountInfo, userPairData } = props;
  const [varA, setVarA] = useState(0);
  const [varB, setVarB] = useState(0);

  useEffect(() => {
    dispatch({
      type: 'stake/getAllPairs',
      payload: {},
    });
    const timeoutA = setTimeout(async () => {
      setVarA(varA + 1);
      dispatch({
        type: 'stake/getAllPairs',
        payload: {},
      });
    }, 30 * 1e3);

    return () => {
      clearTimeout(timeoutA);
    };
  }, [varA]);

  useEffect(() => {
    if (!accountInfo.userAddress) return;
    dispatch({
      type: 'stake/getUserStakeInfo',
      payload: {},
    });
    const timeoutB = setTimeout(async () => {
      setVarB(varB + 1);
      dispatch({
        type: 'stake/getUserStakeInfo',
        payload: {},
      });
    }, 30 * 1e3);

    return () => {
      clearTimeout(timeoutB);
    };
  }, [varB, accountInfo.userAddress]);

  if (
    JSON.stringify(stakePairInfo) === '{}' ||
    JSON.stringify(pairData) === '{}'
  ) {
    return (
      <div className={styles.left_content}>
        <Loading />
      </div>
    );
  } else if (stakePairInfo.message) {
    message.error(stakePairInfo.message);
    return <div className={styles.left_content}>Server Error</div>;
  }

  const { rewardToken, token } = stakePairInfo;
  const { symbol, tokenID, decimal } = token;
  const {
    symbol: rewardTokenSymbol,
    decimal: rewardTokenDecimal,
  } = rewardToken;
  const {
    poolTokenAmount = 0,
    lockedTokenAmount = 0,
    rewardTokenAmount = 0,
    unlockingTokens_user,
  } = { ...pairData, ...userPairData };
  return (
    <div className={styles.left_content}>
      <div className={styles.title}>
        {_('stake_desc', symbol).replace('%1', rewardToken.symbol)}
      </div>
      <div className={styles.coin}>
        <TokenLogo name={symbol} genesisID={tokenID} />
        <div className={styles.coin_name}>{symbol}</div>
      </div>
      <div className={styles.box}>
        <div className={styles.line}>
          <div className={styles.item}>
            <div className={styles.label}>
              {_('your_staked')} {symbol}
            </div>
            <div className={styles.value}>
              <FormatNumber value={formatSat(lockedTokenAmount, decimal)} />
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>{_('total_staked')}</div>
            <div className={styles.value}>
              <FormatNumber value={formatSat(poolTokenAmount, decimal)} />
            </div>
          </div>
        </div>
      </div>
      {unlockingTokens_user && unlockingTokens_user.length > 0 && (
        <div className={styles.box}>
          {unlockingTokens_user.map(({ left, amount, _amount }, index) => (
            <div className={styles.line1} key={index}>
              <div className={styles.item}>
                <div className={styles.label}>{_('unstaked')}</div>
                <div className={styles.value}>
                  <FormatNumber value={_amount} suffix={symbol} />
                </div>
              </div>
              <div className={styles.action}>
                <div className={styles.time}>
                  {!!left &&
                    `${_('vesting_term')}: ${left} ${_(
                      left > 1 ? 'blocks_later' : 'block_later',
                    )}`}
                </div>
                <WithdrawBtn left={left} amount={amount} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.box}>
        <div className={styles.line1}>
          <div className={styles.item}>
            <div className={styles.label}>{_('staking_yield')}</div>
            <div className={styles.value}>
              {rewardTokenAmount > 0 ? (
                <FormatNumber
                  value={formatSat(rewardTokenAmount, rewardTokenDecimal)}
                  suffix={rewardTokenSymbol}
                />
              ) : (
                0
              )}
            </div>
          </div>
          <div className={styles.action}>
            <HarvestBtn />
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = ({ stake, user }) => {
  return {
    ...stake,
    ...user,
  };
};

export default connect(mapStateToProps)(Content);
