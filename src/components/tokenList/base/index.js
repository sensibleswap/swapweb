'use strict';
import React, { Component } from 'react';
import { Spin } from 'antd';
import _ from 'i18n';
import Search from './search';
import List from './list';

export default class PairList extends Component {
  constructor(props) {
    super(props);
    const pairArr = this.handlePairs(props.pairListData);
    this.state = {
      showList: pairArr,
      allPairs: pairArr,
    };
  }

  handlePairs(pairs) {
    let arr = [];
    Object.keys(pairs).forEach((item) => {
      const _obj = {
        ...pairs[item],
        name: pairs[item].token1.symbol + '-' + pairs[item].token2.symbol,
        id: item,
      };
      arr.push(_obj);
    });
    arr.sort((a, b) => {
      return b.poolAmount - a.poolAmount;
    });
    return arr;
  }

  changeShowList = (list) => {
    this.setState({
      showList: list,
    });
  };

  render() {
    const { showList, allPairs } = this.state;
    const { currentPair, loading = false, type } = this.props;
    return (
      <>
        <Search changeShowList={this.changeShowList} allPairs={allPairs} />
        <Spin spinning={loading}>
          <List showList={showList} currentPair={currentPair} type={type} />
        </Spin>
      </>
    );
  }
}
