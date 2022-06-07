import BN from 'bignumber.js';
import { gzip } from 'node-gzip';
import { Button, message } from 'antd';
import { formatSat, formatTok } from 'common/utils';
import TokenIcon from 'components/tokenicon';
import debug from 'debug';
import styles from './index.less';
import _ from 'i18n';

const log = debug('createFarm');

async function payFee(props) {
  const {
    accountInfo,
    dispatch,
    payFinish,
    token1,
    token2,
    values,
    rabinApis,
  } = props;
  const { userAddress, changeAddress } = accountInfo;
  const res = await dispatch({
    type: 'farm/reqCreateFarm',
    payload: {
      address: userAddress,
      source: 'tswap.io',
    },
  });
  // console.log(res);
  if (res.code) {
    return message.error(res.msg);
  }
  const { requestIndex, tokenToAddress, bsvToAddress, txFee } = res.data;

  let tx_res = await dispatch({
    type: 'user/transferAll',
    payload: {
      datas: [
        {
          type: 'bsv',
          address: bsvToAddress,
          amount: txFee,
          changeAddress,
          note: 'tswap.io(createSwap)',
        },
        {
          type: 'sensibleFt',
          address: tokenToAddress,
          amount: formatTok(values.total, token2.decimal),
          changeAddress,
          codehash: token2.codehash,
          genesis: token2.genesis,
          rabinApis,
          note: 'tswap.io(createSwap)',
        },
      ],
      noBroadcast: true,
    },
  });

  if (!tx_res) {
    return message.error(_('txs_fail'));
  }
  if (tx_res.msg) {
    return message.error(tx_res.msg);
  }
  if (tx_res.list) {
    tx_res = tx_res.list;
  }
  // if (!tx_res[0] || !tx_res[0].txid || !tx_res[1] || !tx_res[1].txid) {
  //   return message.error(_('txs_fail'));
  // }
  let fee = BN(txFee).plus(tx_res[0].fee).plus(tx_res[1].fee).toString();
  const { rewardAmountPerBlock, rewardDays } = values;
  const payload = {
    requestIndex,
    bsvRawTx: tx_res[0].txHex,
    bsvOutputIndex: 0,
    tokenRawTx: tx_res[1].txHex,
    tokenOutputIndex: 0,
    amountCheckRawTx: tx_res[1].routeCheckTxHex,

    tokenID: token1.genesis,
    rewardTokenID: token2.genesis,
    rewardAmountPerBlock: formatTok(rewardAmountPerBlock, token2.decimal),
    rewardDays,
  };
  log(payload);
  let create_data = JSON.stringify(payload);

  create_data = await gzip(create_data);

  const create_res = await dispatch({
    type: 'farm/createFarm',
    payload: {
      data: create_data,
    },
  });

  if (create_res.code && !create_res.data) {
    return message.error(create_res.msg);
  }
  message.success('success');
  payFinish({ ...create_res.data, fee: formatSat(fee) });
  // this.setState({
  //     step: 2,
  // });
}

export default function Content1(props) {
  const { token2, values } = props;
  const { symbol, genesisID } = token2;
  const { rewardAmountPerBlock, rewardDays, total } = values;

  return (
    <div className={styles.content1}>
      <div className={styles.title}>{_('check_create_farm_title')}</div>
      <div className={styles.desc}>{_('check_create_farm_desc')}</div>
      <div className={styles.logo}>
        <TokenIcon name={symbol} genesisID={genesisID} size={80} />
      </div>
      <div className={styles.name}>
        {total} {symbol}
      </div>
      <div className={styles.info}>
        <div className={styles.line}>
          <div className={styles.label}>{_('reward')}</div>
          <div className={styles.value}>
            {rewardAmountPerBlock} {symbol} per BSV block
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>{_('duration')}</div>
          <div className={styles.value}>{rewardDays} days</div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>{_('total')}</div>
          <div className={styles.value}>
            {total} {symbol}
          </div>
        </div>
      </div>
      <Button
        className={styles.btn}
        shape="round"
        type="primary"
        onClick={() => payFee(props)}
      >
        {_('deposit_and_create')}
      </Button>
    </div>
  );
}
