'use strict';
import React, { Component } from 'react';
import { connect } from 'umi';
import Menu from './base/menu';
import PairList from './base';
import CustomDecla from './base/customDecla';
import styles from './base/index.less';
import _ from 'i18n';

@connect(({ pair, custom, loading }) => {
  const effects = loading.effects;
  return {
    ...pair,
    ...custom,
    loadingCustomPairs: effects['custom/allPairs'] || false,
  };
})
export default class TokenList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMenuIndex: 0,
      showDec: true,
      customAllPairs: {},
    };
  }

  changeMenu = async (index) => {
    this.setState({
      currentMenuIndex: index,
    });
  };

  startCustomPair = async () => {
    const { customAllPairs } = this.state;
    if (JSON.stringify(customAllPairs) === '{}') {
      const res = await this.props.dispatch({
        type: 'custom/allPairs',
      });
      this.setState({
        customAllPairs: res,
      });
    }

    this.setState({ showDec: false });
  };

  render() {
    const { currentMenuIndex, showDec, customAllPairs } = this.state;
    const { size = 'big', currentPair, allPairs } = this.props;
    return (
      <div className={styles[size]}>
        <Menu
          changeMenu={this.changeMenu}
          currentMenuIndex={currentMenuIndex}
        />
        <div style={{ display: currentMenuIndex === 0 ? 'block' : 'none' }}>
          <PairList
            pairListData={allPairs}
            currentPair={currentPair}
            changeShowList={this.changeShowList}
          />
        </div>
        <div
          style={{
            display: currentMenuIndex === 1 ? 'block' : 'none',
            position: 'relative',
          }}
        >
          {currentMenuIndex === 1 && !showDec && (
            <PairList
              pairListData={customAllPairs}
              currentPair={currentPair}
              changeShowList={this.changeShowList}
              type="custom"
            />
          )}

          {showDec && (
            <CustomDecla
              agree={this.startCustomPair}
              deny={() => this.changeMenu(0)}
            />
          )}
        </div>
      </div>
    );
  }
}
