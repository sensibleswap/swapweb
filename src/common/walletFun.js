import webWallet from 'lib/webWallet';
import voltWallet from 'lib/volt';

const connectWallet = (type = 1) => {
  if (type === 1) {
    return webWallet.requestAccount();
  }
  if (type === 2) {
    return voltWallet.connectAccount({ network: 'mainnet' });
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
const getBsvBalance = async (type = 1) => {
  if (type === 1) {
    const res = await webWallet.getBsvBalance();
    return res.balance;
  }
  if (type === 2) {
    const res = await voltWallet.getBsvBalance();
    return res.free;
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
const getSensibleFtBalance = (type = 1) => {
  if (type === 1) {
    return webWallet.getSensibleFtBalance();
  }
  if (type === 2) {
    return voltWallet.getSensibleFtBalance();
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
const transferAll = (type = 1, param = {}) => {
  if (type === 1) {
    return webWallet.transferAll(param);
  }
  if (type === 2) {
    return voltWallet.batchTransfer(param);
  }
};
export default {
  connectWallet,
  getAccountInfo,
  getBsvBalance,
  getAddress,
  getSensibleFtBalance,
  exitAccount,
  transferBsv,
  transferSensibleFt,
  transferAll,
};
