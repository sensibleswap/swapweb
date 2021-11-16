'use strict';
import React, { Component } from 'react';
import { history } from 'umi';
import { Tooltip } from 'antd';
import EventBus from 'common/eventBus';
import { jc, formatSat, formatAmount } from 'common/utils';
import CustomIcon from 'components/icon';
import FormatNumber from 'components/formatNumber';
import TokenPair from 'components/tokenPair';
import styles from './index.less';
import _ from 'i18n';
import Harvest from './harvest';
const { hash } = window.location;

export default class FarmList extends Component {
  changeCurrentFarm = async (currentFarmPair) => {
    const { allFarmPairs, dispatch } = this.props;

    if (hash.indexOf('farm') > -1) {
      history.push(`/farm/${currentFarmPair}`);
    }
    dispatch({
      type: 'farm/saveFarm',
      payload: {
        currentFarmPair,
        allFarmPairs,
      },
    });
    EventBus.emit('changeFarmPair');
  };

  renderItem(data) {
    const { loading, currentFarmPair, pairsData, allPairs } = this.props;

    const {
      pairName,
      token,
      lockedTokenAmount,
      rewardAmountPerBlock,
      rewardTokenAmount = 0,
      rewardToken,
      _total = 0,
      _yield = 0,
    } = data;
    if (loading || !pairsData[pairName]) {
      return null;
    }
    const { token1, token2 } = allPairs[pairName];
    const [symbol1, symbol2] = pairName.toUpperCase().split('-');

    const { decimal } = rewardToken;

    const _rewardTokenAmount = formatSat(rewardTokenAmount, decimal);

    const reword_amount = formatSat(rewardAmountPerBlock, decimal);

    return (
      <div
        className={
          pairName === currentFarmPair
            ? jc(styles.item, styles.current)
            : styles.item
        }
        key={pairName}
        onClick={() => this.changeCurrentFarm(pairName)}
      >
        <div className={styles.item_header}>
          <div className={styles.item_title}>
            <div className={styles.icon}>
              <TokenPair
                symbol1={symbol2}
                symbol2={symbol1}
                size={20}
                genesisID2={token1.tokenID || 'bsv'}
                genesisID1={token2.tokenID}
              />
            </div>
            <div className={styles.name}>
              {symbol2}/{symbol1}
            </div>
          </div>
          <div className={styles.lp_amount}>
            {_('your_deposited_lp')}:{' '}
            <FormatNumber value={formatSat(lockedTokenAmount, token.decimal)} />
          </div>
        </div>

        <div className={styles.item_data}>
          <div>
            <div className={styles.label}>{_('tvl')}</div>
            <div className={styles.value}>
              <FormatNumber value={_total} useAbbr={true} suffix="USDT" />
            </div>
          </div>
          <div>
            <Tooltip
              title={_('apy_info').replace(/%1/g, rewardToken.symbol)}
              placement="bottom"
            >
              <div
                className={styles.label}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {_('apy')}
                <CustomIcon
                  type="iconi"
                  style={{
                    border: '1px solid #e8e8e8',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    fontSize: 15,
                    padding: 2,
                    width: 15,
                    textAlign: 'center',
                    marginLeft: 10,
                  }}
                />
              </div>
            </Tooltip>
            <div className={styles.value}>
              <FormatNumber value={_yield} />%
            </div>
          </div>
          <div>
            <Tooltip title={_('payout_tips')} placement="bottom">
              <div className={styles.label}>
                {_('payout')}
                <CustomIcon
                  type="iconi"
                  style={{
                    border: '1px solid #e8e8e8',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    fontSize: 15,
                    padding: 2,
                    width: 15,
                    textAlign: 'center',
                    marginLeft: 8,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </Tooltip>
            <div className={styles.value}>
              <FormatNumber value={reword_amount} />
            </div>
          </div>
          <div className={styles.item_detail_line_2}>
            <div className={styles.label}>
              {_('crop')} ({rewardToken.symbol}):
            </div>
            <Tooltip
              title={`${_('yield_tips', _rewardTokenAmount)} ${
                rewardToken.symbol
              }`}
              placement="bottom"
            >
              <div
                className={styles.value}
                style={{ fontSize: 12, color: '#2F80ED' }}
              >
                <FormatNumber
                  value={formatAmount(_rewardTokenAmount, rewardToken.decimal)}
                />
              </div>
            </Tooltip>
          </div>
          <Harvest
            pairName={pairName}
            data={data}
            {...this.props}
            rewardTokenAmount={rewardTokenAmount}
          />
        </div>
      </div>
    );
  }

  render() {
    const { allFarmPairs, allFarmPairsArr } = this.props;
    return (
      <div className={styles.content}>
        <div className={styles.farm_intro}>{_('farm_desc')}</div>
        <div className={styles.farm_title}>
          {allFarmPairs.blockHeight &&
            `${_('last_block_height')} #${allFarmPairs.blockHeight}`}
        </div>
        <div className={styles.items}>
          {allFarmPairsArr.map((item) => {
            return this.renderItem(item);
          })}
        </div>
      </div>
    );
  }
}
