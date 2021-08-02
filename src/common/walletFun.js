import webWallet from 'lib/webWallet';
import voltWallet from 'lib/volt';
import { formatSat } from 'common/utils';
import { DEFAULT_NET } from 'common/const';

const connectWallet = (type = 1) => {
  if (type === 1) {
    return webWallet.requestAccount();
  }
  if (type === 2) {
    return voltWallet.connectAccount({ network: DEFAULT_NET });
  }
};
const getAccountInfo = (type = 1) => {
  if (type === 1) {
    return webWallet.getAccount();
  }
  if (type === 2) {
    return voltWallet.getAccountInfo();
  }
};
const getPaymail = (type) => {
  if (type === 2) {
    return voltWallet.getPaymail();
  }
  return false;
};
const getBsvBalance = async (type = 1) => {
  if (type === 1) {
    const res = await webWallet.getBsvBalance();

    return formatSat(res.balance);
  }
  if (type === 2) {
    const res = await voltWallet.getBsvBalance();
    return formatSat(res.free);
  }
};
const getAddress = (type = 1) => {
  if (type === 1) {
    return webWallet.getAddress();
  }
  if (type === 2) {
    return voltWallet.getDepositAddress();
  }
};
const getSensibleFtBalance = async (type = 1) => {
  if (type === 1) {
    const res = await webWallet.getSensibleFtBalance();
    const userBalance = {};
    res.forEach((item) => {
      userBalance[item.genesis] = formatSat(item.balance, item.tokenDecimal);
    });
    return userBalance;
  }
  if (type === 2) {
    const res = await voltWallet.getSensibleFtBalance();
    const userBalance = {};
    res.forEach((item) => {
      userBalance[item.genesis] = formatSat(item.free, item.tokenDecimal);
    });
    return userBalance;
  }
};
const exitAccount = (type = 1) => {
  if (type === 1) {
    return webWallet.exitAccount();
  }
  if (type === 2) {
    return voltWallet.disconnectAccount();
  }
};
const transferBsv = (type = 1, { address, amount }) => {
  if (type === 1) {
    return webWallet.transferBsv({
      receivers: [
        {
          address,
          amount,
        },
      ],
    });
  }
  if (type === 2) {
    return voltWallet.transfer({
      type: 'bsv',
      data: {
        amountExact: false,
        receivers: [{ address, amount }],
      },
    });
  }
};
const transferSensibleFt = (
  type = 1,
  { address, amount, codehash, genesis },
) => {
  if (type === 1) {
    return webWallet.transferSensibleFt({
      receivers: [
        {
          address,
          amount,
        },
      ],
      codehash,
      genesis,
    });
  }
  if (type === 2) {
    return voltWallet.transfer({
      type: 'sensibleFt',
      data: {
        codehash,
        genesis,
        receivers: [{ address, amount }],
      },
    });
  }
};
const transferAll = (type = 1, param = []) => {
  if (type === 1) {
    let data = [];
    param.forEach((item) => {
      if (item.type === 'bsv') {
        let { address, amount } = item;
        data.push({
          receivers: [
            {
              address,
              amount,
            },
          ],
        });
      } else if (item.type === 'sensibleFt') {
        let { address, amount, codehash, genesis, rabinApis } = item;
        data.push({
          receivers: [
            {
              address,
              amount,
            },
          ],
          codehash,
          genesis,
          rabinApis,
        });
      }
    });
    return webWallet.transferAll(data);
  }
  if (type === 2) {
    let data = [];
    param.forEach((item) => {
      const { address, amount, codehash, genesis } = item;
      if (item.type === 'bsv') {
        data.push({
          type: 'bsv',
          data: {
            amountExact: false,
            receivers: [{ address, amount }],
          },
        });
      } else if (item.type === 'sensibleFt') {
        data.push({
          type: 'sensibleFt',
          data: {
            codehash,
            genesis,
            receivers: [{ address, amount }],
          },
        });
      }
    });

    return voltWallet.batchTransfer({
      errorBreak: true,
      list: data,
    });
  }
};
export default {
  connectWallet,
  getAccountInfo,
  getPaymail,
  getBsvBalance,
  getAddress,
  getSensibleFtBalance,
  exitAccount,
  transferBsv,
  transferSensibleFt,
  transferAll,
};
