'use strict';
import React, { Component } from 'react';
import { history } from 'umi';
import { Tooltip } from 'antd';
import TokenPair from 'components/tokenPair';
import FormatNumber from 'components/formatNumber';
import EventBus from 'common/eventBus';
import { jc, formatSat, formatAmount } from 'common/utils';
import Harvest from './harvest';
import styles from './index.less';
import _ from 'i18n';
import { Iconi } from 'components/ui';

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
    const { loading, currentFarmPair, pairsData, isLogin } = this.props;

    const {
      id,
      token,
      abandoned = false,
      lockedTokenAmount,
      rewardAmountPerBlock,
      rewardTokenAmount = 0,
      rewardToken,
      _total = 0,
      _yield = 0,
    } = data;
    let { tokenID, symbol } = token;
    if (loading || !pairsData[tokenID]) {
      return null;
    }
    const { token1, token2 } = pairsData[tokenID];
    const symbol1 = token1.symbol.toUpperCase();
    const symbol2 = token2.symbol.toUpperCase();

    const { decimal } = rewardToken;

    const _rewardTokenAmount = isLogin
      ? formatSat(rewardTokenAmount, decimal)
      : 0;
    const _lockedTokenAmount = isLogin
      ? formatSat(lockedTokenAmount, token.decimal)
      : 0;

    const reword_amount = formatSat(rewardAmountPerBlock, decimal);

    let cls = styles.item;
    if (abandoned || symbol === 'TSC/FTT') {
      cls = jc(styles.item, styles.warn);
    }

    if (id === currentFarmPair) {
      cls = jc(cls, styles.current);
    }
    return (
      <div className={cls} key={id} onClick={() => this.changeCurrentFarm(id)}>
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
              {symbol2}/{symbol1} {abandoned && '(old)'}
            </div>
          </div>
          <div className={styles.lp_amount}>
            {symbol === 'TSC/FTT' && _('tmp_tips')}
            {abandoned && _('abandoned_deposited_lp')}
            {symbol !== 'TSC/FTT' && !abandoned && _('your_deposited_lp')}:{' '}
            <FormatNumber value={_lockedTokenAmount} />
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
              <div className={styles.label}>
                {_('apy')}
                <Iconi />
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
                <Iconi />
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
              <div className={jc(styles.value, styles.blue)}>
                <FormatNumber
                  value={formatAmount(_rewardTokenAmount, rewardToken.decimal)}
                />
              </div>
            </Tooltip>
          </div>
          <Harvest
            id={id}
            data={data}
            {...this.props}
            rewardTokenAmount={rewardTokenAmount}
          />
        </div>
      </div>
    );
  }

  render() {
    const { allFarmPairsArr, blockHeight } = this.props;
    return (
      <div className={styles.content}>
        <div className={styles.farm_intro}>{_('farm_desc')}</div>
        <div className={styles.farm_title}>
          {blockHeight && `${_('last_block_height')} #${blockHeight}`}
        </div>
        <div className={styles.items}>
          {allFarmPairsArr.length > 0 &&
            allFarmPairsArr.map((item) => {
              return this.renderItem(item);
            })}
        </div>
      </div>
    );
  }
}
