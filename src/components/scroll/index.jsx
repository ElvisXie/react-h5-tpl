import React, {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  useMemo
} from 'react';
import PropTypes from 'prop-types';
import BScroll from '@better-scroll/core';
import PullDown from '@better-scroll/pull-down';
import Pullup from '@better-scroll/pull-up';
import { debounce } from 'lodash';

import styles from './index.less';

BScroll.use(PullDown);
BScroll.use(Pullup);

const Scroll = forwardRef((props, ref) => {
  const [bScroll, setBScroll] = useState();

  const scrollContaninerRef = useRef();

  const {
    direction,
    click,
    refresh,
    pullUpLoading,
    pullDownLoading,
    bounceTop,
    bounceBottom
  } = props;

  const { pullUp, pullDown, onScroll } = props;

  const pullUpDebounce = useMemo(() => {
    return debounce(pullUp, 300);
  }, [pullUp]);

  const pullDownDebounce = useMemo(() => {
    return debounce(pullDown, 300);
  }, [pullDown]);

  /**
   * 初始化 BScroll 组件
   */
  useEffect(() => {
    const scroll = new BScroll(scrollContaninerRef.current, {
      scrollX: direction === 'horizental',
      scrollY: direction === 'vertical',
      probeType: 3,
      click,
      bounce: {
        top: bounceTop,
        bottom: bounceBottom
      },
      pullDownRefresh: true,
      pullUpLoad: true
    });
    setBScroll(scroll);

    return () => {
      setBScroll(null);
    };
  }, []);

  /**
   * 绑定 scroll 事件
   */
  useEffect(() => {
    if (!bScroll || !onScroll) {
      return undefined;
    }

    bScroll.on('scroll', (scroll) => {
      onScroll(scroll);
    });

    return () => {
      bScroll.off('scroll');
    };
  }, [onScroll, bScroll]);

  /**
   * 绑定 scrollEnd 事件，处理用户上拉加载操作
   */
  useEffect(() => {
    if (!bScroll || !pullUp) {
      return undefined;
    }

    bScroll.on('scrollEnd', () => {
      // 判断是否滑动到了底部
      if (bScroll.y <= bScroll.maxScrollY + 100) {
        pullUpDebounce();
      }
    });

    return () => {
      bScroll.off('scrollEnd');
    };
  }, [pullUp, pullUpDebounce, bScroll]);

  /**
   * 绑定 touchEnd 事件，处理用户下拉刷新操作
   */
  useEffect(() => {
    if (!bScroll || !pullDown) {
      return undefined;
    }

    bScroll.on('touchEnd', (pos) => {
      // 判断用户的下拉动作
      if (pos.y > 50) {
        pullDownDebounce();
      }
    });

    return () => {
      bScroll.off('touchEnd');
    };
  }, [pullDown, pullDownDebounce, bScroll]);

  useEffect(() => {
    if (refresh && bScroll) {
      bScroll.refresh();
    }
  });

  useImperativeHandle(ref, () => ({
    refresh() {
      if (bScroll) {
        bScroll.refresh();
        bScroll.scrollTo(0, 0);
      }
    },
    getBScroll() {
      return bScroll || null;
    }
  }));

  return (
    <div className={styles.scrollContainer} ref={scrollContaninerRef}>
      {props.children}
    </div>
  );
});

Scroll.defaultProps = {
  direction: 'vertical',
  click: true,
  refresh: true,
  onScroll: null,
  pullUpLoading: false,
  pullDownLoading: false,
  pullUp: null,
  pullDown: null,
  bounceTop: true,
  bounceBottom: true
};

Scroll.propTypes = {
  direction: PropTypes.oneOf(['vertical', 'horizental']),
  refresh: PropTypes.bool,
  click: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  onScroll: PropTypes.func,
  pullUp: PropTypes.func,
  pullDown: PropTypes.func,
  pullUpLoading: PropTypes.bool,
  pullDownLoading: PropTypes.bool,
  // 当滚动超过边缘的时候会有一小段回弹动画。设置为 true 则开启动画
  bounceTop: PropTypes.bool, // 是否支持向上吸顶
  bounceBottom: PropTypes.bool // 是否支持向上吸顶
};
export default React.memo(Scroll);
