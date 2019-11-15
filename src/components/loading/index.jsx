import React, { memo } from 'react';
import styles from './index.less';

const Loading = memo(() => (
  <div className={styles.spinner}>
    <div className={styles.bounce1} />
    <div className={styles.bounce2} />
    <div className={styles.bounce3} />
  </div>
));

export default Loading;
