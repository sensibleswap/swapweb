import voltWallet from './voltWallet';
// import appWallet from './appWallet';
import sensiletWallet from './sensWallet';
import extWallet from './extWallet';

export default function wallet(props) {
  const { type } = props;

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
