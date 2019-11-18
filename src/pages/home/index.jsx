import React, { Component } from 'react';
import { Toast, WhiteSpace } from 'antd-mobile';

import styles from './index.less';
import Logo from '@/assets/images/logo.svg';

class Home extends Component {
  handleHello = () => {
    Toast.info('Hello~');
  };

  render() {
    return (
      <div className={styles.wrap}>
        <WhiteSpace size="lg" />
        <div>首页内容啊</div>
        <div>
          {/* eslint-disable-next-line */}
          <img src={Logo} alt=" " onClick={this.handleHello} />
        </div>
      </div>
    );
  }
}

export default Home;
