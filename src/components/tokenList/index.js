'use strict';
import React, { Component } from 'react';
import { Input } from 'antd';
import querystring from 'querystringify';
import { CheckCircleOutlined } from '@ant-design/icons';
import { TSWAP_CURRENT_PAIR } from 'common/const';
import TokenPair from 'components/tokenPair';
import { connect } from 'umi';
import styles from './index.less';
import _ from 'i18n';

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
  }

  select = (currentPair) => {
    if (currentPair && currentPair !== this.props.currentPair) {
      window.localStorage.setItem(TSWAP_CURRENT_PAIR, currentPair);

      this.props.dispatch({
        type: 'pair/getPairData',
        payload: {
          currentPair,
        },
      });
      const { finish } = this.props;
      finish && finish();
    }
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
