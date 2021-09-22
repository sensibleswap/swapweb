'use strict';
import React, { Component } from 'react';
import { Button, Alert } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Lang from '../layout/lang';
import Nav from '../layout/nav';
import Footer from '../layout/footer';
import CustomIcon from 'components/icon';
import Notice from 'components/notice';
import Cookie from 'js-cookie';
import styles from './index.less';
import _ from 'i18n';

const _lang = Cookie.get('lang') || navigator.language;
export default class Home extends Component {
  renderList() {
    return (
      <div className={styles.list_container}>
        <div className={styles.list}>
          <div className={styles.list_hd}>
            <div className={styles.col_1}>{_('feature')}</div>
            <div className={styles.col_2}>{_('tokenswap')}</div>
            <div className={styles.col_3}>{_('cex')}</div>
            <div className={styles.col_4}>{_('other_dex')}</div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_1')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CheckOutlined className={styles.green} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_2')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CheckOutlined className={styles.green} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_3')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CloseOutlined className={styles.red} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_4')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CloseOutlined className={styles.red} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_5')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CloseOutlined className={styles.red} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_6')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CloseOutlined className={styles.red} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_7')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CheckOutlined className={styles.green} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_8')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CheckOutlined className={styles.green} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_9')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CloseOutlined className={styles.red} />
            </div>
          </div>
          <div className={styles.list_item}>
            <div className={styles.col_1}>{_('lb_10')}</div>
            <div className={styles.col_2}>
              <CheckOutlined className={styles.green} />
            </div>
            <div className={styles.col_3}>
              <CloseOutlined className={styles.red} />
            </div>
            <div className={styles.col_4}>
              <CloseOutlined className={styles.red} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const isZh = _lang.toLowerCase() === 'zh-cn';
    return (
      <>
        <Notice />
        <section className={styles.container}>
          <nav className={styles.head}>
            <div className={styles.head_inner}>
              <Nav />
              <div className={styles.head_right}>
                <Button
                  type="primary"
                  className={styles.cta}
                  shape="round"
                  onClick={() => {
                    this.props.history.push('swap');
                  }}
                >
                  {_('use_tokenswap')}
                </Button>
                <Lang />
              </div>
            </div>
          </nav>
          <section className={styles.main}>
            <div className={styles.logo}>
              <CustomIcon type="iconTS_Logo" style={{ fontSize: 80 }} />
            </div>
            <div className={styles.main_title}>{_('tokenswap')}</div>
            <div className={styles.main_desc}>{_('tokenswap_desc')}</div>
            <div className={styles.btns}>
              <Button
                type="primary"
                className={styles.btn}
                shape="round"
                style={{ marginRight: 20 }}
                onClick={() => {
                  this.props.history.push('swap');
                }}
              >
                {_('use_tokenswap')}
              </Button>
              <Button
                className={styles.btn}
                shape="round"
                onClick={() => {
                  window.location.href = isZh
                    ? 'https://tokenswap.gitbook.io/tokenswap/v/zhong-wen/'
                    : 'https://tokenswap.gitbook.io/tokenswap/';
                }}
              >
                {_('documentation')}
              </Button>
            </div>
          </section>
          <section className={styles.content}>
            <div className={styles.title_web}>{_('comp_ts')}</div>
            <div className={styles.title_h5}>{_('comp_ts_h5')}</div>
            {this.renderList()}
          </section>
          <Footer />
        </section>
      </>
    );
  }
}
