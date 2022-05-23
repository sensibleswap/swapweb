import { connect } from 'umi';
import Loading from 'components/loading';
import styles from './index.less';
import _ from 'i18n';

function List(props) {
  const { voteInfo, dispatch, currentVoteId } = props;

  const detail = (key) => {
    dispatch({
      type: 'stake/save',
      payload: {
        currentVoteId: key,
      },
    });
  };

  const status = (info) => {
    const { unstarted, finished } = info;
    if (unstarted) {
      //投票未开始
      return _('pending');
    }

    if (!finished) {
      //投票未结束
      return <span className={styles.purple}>{_('ongoing')}</span>;
    }

    return '';
  };

  if (JSON.stringify(voteInfo) === '{}') {
    return (
      <div className={styles.left_content}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={styles.left_content}>
      <div className={styles.list}>
        {Object.keys(voteInfo).map((item, index, arr) => {
          const currentVoteInfo = voteInfo[item];
          const { title, beginBlockNum, endBlockNum } = currentVoteInfo;
          return (
            <div
              className={
                item === currentVoteId
                  ? `${styles.item} ${styles.item_selected}`
                  : styles.item
              }
              key={item}
              onClick={() => detail(item)}
            >
              <div className={styles.line}>
                <div className={styles.title}>{title}</div>
                <div className={styles.status}>{status(currentVoteInfo)}</div>
              </div>
              <div className={styles.desc}>
                {arr.length - index} from block #{beginBlockNum} to block #
                {endBlockNum}
              </div>
            </div>
          );
        })}
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

export default connect(mapStateToProps)(List);
