import React from 'react';
import { Toast, WhiteSpace } from 'antd-mobile';

import styles from './index.less';
import Logo from '@/assets/images/logo.svg';

const Home = () => {
  const handleHello = () => {
    Toast.info('Hello~');
  };

  return (
    <div className={styles.wrap}>
      <WhiteSpace size="lg" />
      <div>首页内容</div>
      {/* eslint-disable-next-line */}
      <img src={Logo} alt=" " onClick={handleHello} />
    </div>
  );
};

export default Home;
