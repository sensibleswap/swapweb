'use strict';
import React, { Component } from 'react';
import { Input, message, Button } from 'antd';
import EventBus from 'common/eventBus';
import querystring from 'querystringify';
import { CheckCircleOutlined } from '@ant-design/icons';
import { TSWAP_CURRENT_PAIR } from 'common/const';
import { jc } from 'common/utils';
import TokenPair from 'components/tokenPair';
import { history, connect, Link } from 'umi';
import styles from './index.less';
import _ from 'i18n';
import Cookie from 'js-cookie';

const lang = Cookie.get('lang') || navigator.language;

let i = 0;
const query = querystring.parse(window.location.search);
const { Search } = Input;
const listMenu = [_('curated_tokens'), _('unverified_zone')];

@connect(({ pair, custom }) => {
  return {
    ...pair,
  };
})
export default class TokenList extends Component {
  constructor(props) {
    super(props);
    const { pairList } = props;
    let _allPairs = [],
      _showList = [];
    Object.keys(pairList).forEach((item) => {
      const _obj = {
        ...pairList[item],
        name: item,
      };
      _allPairs.push(_obj);
      _showList.push(_obj);
    });
    this.state = {
      showList: _showList,
      allPairs: _allPairs,
      currentMenuIndex: 0,
      customShowList: [],
      showDec: true,
    };

    window.addEventListener('hashchange', (event) => {
      const { newURL, oldURL } = event;
      if (newURL !== oldURL) {
        let newHash = newURL.substr(newURL.indexOf('#'));
        let oldHash = oldURL.substr(oldURL.indexOf('#'));
        newHash = newHash.split('/');
        oldHash = oldHash.split('/');
        if (
          newHash[1] === oldHash[1] &&
          newHash[2] &&
          newHash[2] !== oldHash[2]
        ) {
          this.changeToken(newHash[2].toLowerCase());
        }
      }
    });
  }

  select = async (currentPair, type) => {
    const { dispatch } = this.props;
    if (currentPair && currentPair !== this.props.currentPair) {
      // await dispatch({
      //   type: 'pair/save',
      //   payload: {
      //     customPair: type === 'custom',
      //     currentPair,
      //   },
      // });

      const { hash } = location;
      if (hash.indexOf('swap') > -1) {
        history.push(`/swap/${currentPair}`);
      } else if (hash.indexOf('add') > -1) {
        history.push(`/pool/${currentPair}/add`);
      } else if (hash.indexOf('remove') > -1) {
        history.push(`/pool/${currentPair}/remove`);
      }

      EventBus.emit('reloadPair');
    }
  };

  changeToken = async (currentPair) => {
    const { dispatch, finish } = this.props;
    window.localStorage.setItem(TSWAP_CURRENT_PAIR, currentPair);
    if (currentPair.length === 40) {
      await dispatch({
        type: 'pair/getAllPairs',
        payload: {
          symbol: currentPair,
        },
      });
    }

    await dispatch({
      type: 'pair/getPairData',
      payload: {
        currentPair,
      },
    });
    // }

    let { hash } = location;
    if (hash.indexOf('swap') > -1) {
      EventBus.emit('reloadChart', 'swap');
    } else if (hash.indexOf('pool') > -1) {
      EventBus.emit('reloadChart', 'pool');
    }
    finish && finish(currentPair);
  };

  escapeRegExpWildcards(searchStr) {
    const regExp = /([\(\[\{\\\^\$\}\]\)\?\*\+\.])/gim;
    if (searchStr && regExp.test(searchStr)) {
      return searchStr.replace(regExp, '\\$1');
    }
    return searchStr;
  }

  searchByKeywords(keywords, searchArr) {
    const keywordsExp = new RegExp(
      '.*?' + this.escapeRegExpWildcards(keywords) + '.*?',
      'img',
    );

    return searchArr.filter((v) => {
      return (
        keywordsExp.test(v.token1.symbol) ||
        keywordsExp.test(v.token2.symbol) ||
        keywords == v.token1.tokenID ||
        keywords == v.token2.tokenID
      );
    });
  }

  handleChange = (e) => {
    const { value } = e.target;
    const { allPairs } = this.state;
    // if(!token) return;
    if (!value) {
      return this.setState({
        showList: allPairs,
      });
    }
    const res = this.searchByKeywords(value, allPairs);
    this.setState({
      showList: res,
    });
  };

  handleChangeCustom = async (e) => {
    const { value } = e.target;
    const { dispatch } = this.props;
    let res = await dispatch({
      type: 'custom/pairInfo',
      payload: {
        symbol: value,
      },
    });
    if (res.msg) {
      message.error(res.msg);
    }

    this.setState({
      customShowList: res,
    });
  };

  renderList(item, index, type) {
    const { currentPair, customPair } = this.props;
    return (
      <div
        className={styles.item}
        key={item.name + index}
        onClick={() =>
          this.select(type === 'custom' ? item.token2.tokenID : item.name, type)
        }
      >
        <div className={styles.icon_name}>
          <div className={styles.icon}>
            <TokenPair
              symbol1={item.token1.symbol}
              symbol2={item.token2.symbol}
              size={25}
            />
          </div>
          <div className={styles.name}>{item.name.toUpperCase()}</div>
        </div>
        <div className={styles.selected}>
          {((type === 'custom' &&
            customPair &&
            currentPair === item.token2.tokenID) ||
            (type !== 'custom' &&
              !customPair &&
              currentPair === item.name)) && (
            <CheckCircleOutlined
              theme="filled"
              style={{ color: '#2F80ED', fontSize: 30 }}
            />
          )}
        </div>
      </div>
    );
  }

  render() {
    const { showList, customShowList, currentMenuIndex, showDec } = this.state;
    const { size = 'big' } = this.props;
    const isZh = lang.toLowerCase() === 'zh-cn';
    return (
      <div className={styles[size]}>
        <div className={styles.menu}>
          {listMenu.map((menu, index) => (
            <span
              className={
                currentMenuIndex === index
                  ? jc(styles.menu_item, styles.menu_item_selected)
                  : styles.menu_item
              }
              onClick={() => {
                this.setState({ currentMenuIndex: index });
              }}
              key={menu}
            >
              {menu}
            </span>
          ))}
        </div>
        <div style={{ display: currentMenuIndex === 0 ? 'block' : 'none' }}>
          <div className={styles.search}>
            <Search
              size="large"
              className={styles.search_input}
              placeholder={_('search_token_holder')}
              onChange={this.handleChange}
            />
          </div>
          <div className={styles.token_list}>
            {showList &&
              showList.map((item, index) => {
                if ((item.test && query.env === 'local') || !item.test) {
                  return this.renderList(item, index);
                }
              })}
          </div>
        </div>
        <div
          style={{
            display: currentMenuIndex === 1 ? 'block' : 'none',
            position: 'relative',
          }}
        >
          <Search
            size="large"
            className={styles.search_input}
            placeholder={_('search_token_holder')}
            onChange={this.handleChangeCustom}
          />

          <div className={styles.token_list}>
            {customShowList &&
              customShowList.map((item, index) => {
                if ((item.test && query.env === 'local') || !item.test) {
                  return this.renderList(item, index, 'custom');
                }
              })}
          </div>

          {showDec && (
            <div className={styles.decla}>
              <div className={styles.dec_title}>{_('risks_dis')}</div>
              <p className={styles.dec_desc}>{_('risks_desc')}</p>
              <a
                href={
                  isZh
                    ? 'https://tokenswap.gitbook.io/tokenswap/v/zhong-wen/general-faq/feng-xian-ti-shi'
                    : 'https://tokenswap.gitbook.io/tokenswap/risks'
                }
                target="_blank"
                className={styles.btn_link}
              >
                {_('risks_dis')}
              </a>
              <Button
                type="primary"
                className={styles.btn}
                onClick={() => this.setState({ showDec: false })}
              >
                {_('acknowlege')}
              </Button>
              <div
                className={styles.not}
                onClick={() => this.setState({ currentMenuIndex: 0 })}
              >
                {_('not_acknowlege')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
