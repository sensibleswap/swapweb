'use strict';
import React, { Component } from 'react';
import { Input } from 'antd';
import EventBus from 'common/eventBus';
import querystring from 'querystringify';
import { CheckCircleOutlined } from '@ant-design/icons';
import { TSWAP_CURRENT_PAIR } from 'common/const';
import TokenPair from 'components/tokenPair';
import { history, connect } from 'umi';
import styles from './index.less';
import _ from 'i18n';

let i = 0;
const query = querystring.parse(window.location.search);
const { Search } = Input;

@connect(({ pair }) => {
  return {
    ...pair,
  };
})
export default class TokenList extends Component {
  constructor(props) {
    super(props);
    const { allPairs } = props;
    let _allPairs = [],
      _showList = [];
    Object.keys(allPairs).forEach((item) => {
      const _obj = {
        ...allPairs[item],
        name: item,
      };
      _allPairs.push(_obj);
      _showList.push(_obj);
    });
    this.state = {
      showList: _showList,
      allPairs: _allPairs,
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

  select = (currentPair) => {
    if (currentPair && currentPair !== this.props.currentPair) {
      let { hash } = location;
      if (hash.indexOf('swap') > -1) {
        history.push(`/swap/${currentPair}`);
      } else if (hash.indexOf('add') > -1) {
        history.push(`/pool/${currentPair}/add`);
      } else if (hash.indexOf('remove') > -1) {
        history.push(`/pool/${currentPair}/remove`);
      }
    }
  };

  changeToken = async (currentPair) => {
    window.localStorage.setItem(TSWAP_CURRENT_PAIR, currentPair);

    await this.props.dispatch({
      type: 'pair/getPairData',
      payload: {
        currentPair,
      },
    });
    const { finish } = this.props;
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

  render() {
    const { showList } = this.state;
    const { currentPair, size = 'big' } = this.props;
    return (
      <div className={styles[size]}>
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
                return (
                  <div
                    className={styles.item}
                    key={item.name + index}
                    onClick={() => this.select(item.name)}
                  >
                    <div className={styles.icon_name}>
                      <div className={styles.icon}>
                        <TokenPair
                          symbol1={item.token1.symbol}
                          symbol2={item.token2.symbol}
                          size={25}
                        />
                      </div>
                      <div className={styles.name}>
                        {item.name.toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.selected}>
                      {item.name === currentPair && (
                        <CheckCircleOutlined
                          theme="filled"
                          style={{ color: '#2F80ED', fontSize: 30 }}
                        />
                      )}
                    </div>
                  </div>
                );
              }
            })}
        </div>
      </div>
    );
  }
}
