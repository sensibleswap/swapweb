import tsWallet from './tsWallet';
import voltWallet from './voltWallet';
// import appWallet from './appWallet';
import sensiletWallet from './sensWallet';
import extWallet from './extWallet';

export default function wallet(props) {
  const { type } = props;
  if (type === 1) {
    //ts wallet 网页钱包
    return tsWallet;
  }

  if (type === 2) {
    //web volt 钱包
    return voltWallet;
  }

  // if (type === 3) {
  //   //app volt 钱包
  //   return appWallet;
  // }

  if (type === 4) {
    return sensiletWallet;
  }

  if (type === 5) {
    return extWallet;
  }
}
