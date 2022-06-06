import { connect } from 'umi';
import { message } from 'antd';
import { formatSat } from 'common/utils';
import Loading from 'components/loading';
import TokenLogo from 'components/tokenicon';
import FormatNumber from 'components/formatNumber';
import styles from './index.less';
import _ from 'i18n';
import HarvestBtn from './harvest';
import WithdrawBtn from './withdraw';

function Content(props) {
  const { pairData, stakePairInfo } = props;

  if (stakePairInfo.msg) {
    message.error(stakePairInfo.msg);
    return <div className={styles.left_content}>Server Error</div>;
  } else if (
    JSON.stringify(stakePairInfo) === '{}' ||
    JSON.stringify(pairData) === '{}'
  ) {
    return (
      <div className={styles.left_content}>
        <Loading />
      </div>
    );
  } else if (!stakePairInfo.token) {
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
    rewardAmountPerBlock,
  } = pairData;
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

      <div className={styles.box}>
        <div className={styles.line1}>
          <div className={styles.left}>
            <div className={styles.item}>
              <div className={styles.label}>{_('payout_per_block')}</div>
              <div className={styles.value}>
                {rewardAmountPerBlock > 0 ? (
                  <FormatNumber
                    value={formatSat(rewardAmountPerBlock, rewardTokenDecimal)}
                    suffix={rewardTokenSymbol}
                  />
                ) : (
                  0
                )}
              </div>
            </div>
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
          </div>
          <div className={styles.action}>
            <HarvestBtn />
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
    </div>
  );
}

const mapStateToProps = ({ stake, user }) => {
  return {
    ...stake,
  };
};

export default connect(mapStateToProps)(Content);
