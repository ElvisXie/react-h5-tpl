import { Toast } from 'antd-mobile';

function createAsyncAction(name, callback, meta = {}) {
  if (typeof callback !== 'function') {
    throw new Error('[createAsyncAction] callback should be a function');
  }

  return (dispatch) => {
    dispatch({
      meta,
      type: `${name}_PENDING`
    });

    try {
      return callback()
        .then((value) => {
          const action = {
            meta,
            type: `${name}_SUCCESS`,
            payload: value.data
          };

          if (value.code === '200' || value.status === 200) {
            dispatch(action);
            return action;
          }

          Toast.fail(value.message);
          return Promise.reject(value);
        })
        .catch((err) => {
          const action = {
            meta,
            type: `${name}_ERROR`,
            payload: err,
            error: true
          };

          dispatch(action);
          return action;
        });
    } catch (err) {
      const action = {
        meta,
        type: `${name}_ERROR`,
        payload: err,
        error: true
      };

      Toast.fail(err.message);
      dispatch(action);
      return Promise.resolve(action);
    }
  };
}

export default createAsyncAction;
