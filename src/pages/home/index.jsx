import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import styles from "./index.less";

const propTypes = {};

class Home extends Component {
  static propTypes = propTypes;

  render() {
    return <div className={styles.wrap}>首页内容啊</div>;
  }
}

export default Home;
