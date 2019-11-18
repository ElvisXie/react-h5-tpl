/**
 * 判断 ant-mobile 表单域是否有错误提示
 * @param {*} fieldsError
 */
export const hasErrors = (fieldsError) =>
  Object.keys(fieldsError).some((field) => fieldsError[field]);

/**
 * 将数值四舍五入(保留2位小数)后格式化成金额形式
 *
 * @param {number | string} num 数值(Number或者String)
 * @return 金额格式的字符串,如'1,234,567.45'
 * @type String
 */
export const fillMoneyZero = (num) => {
  if (num === null || num === undefined || Number.isNaN(parseFloat(num))) {
    return NaN;
  }
  /* eslint-disable */
  num = num.toString().replace(/[^\d\.-]/g, ''); // 转成字符串并去掉其中除数字, . 和 - 之外的其它字符。

  // 是否非数字值
  if (isNaN(num)) {
    num = '0';
  }

  const sign = num == (num = Math.abs(num));
  num = Math.floor(num * 100 + 0.50000000001); // 下舍入
  let cents = num % 100; // 求余 余数 = 被除数 - 除数 * 商
  cents = cents < 10 ? '0' + cents : cents; // 小于2位数就补齐
  num = Math.floor(num / 100).toString();

  for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    // 每隔三位小数分始开隔
    // 4 ==> 三位小数加一个分隔符，
    num =
      num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }

  return (sign ? '' : '-') + num + '.' + cents;
};

/**
 * 判断是否是 Android 终端
 */
export const isAndroid =
  navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;

/**
 * 判断是否是 iOS 终端
 */
export const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

/**
 * 压缩图片
 * @param {objec} file 图片文件对象
 * @param {Function} callback 图片转换完成之后执行的回调方法
 */
export const compressImg = async (file) => {
  // 选择的文件是图片
  if (file.type.indexOf('image') !== 0) {
    throw new Error('file 不是图片类型文件');
  }

  // 压缩图片需要的一些元素和对象
  let reader = new FileReader();
  let img = new Image();

  // 缩放图片需要的canvas
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');

  // 文件 base64 化，以便获知图片原始尺寸
  reader.onload = function(e) {
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);

  return await new Promise((resolve, reject) => {
    // base64 地址图片加载完毕后
    img.onload = async function() {
      // 图片原始尺寸
      let originWidth = this.width;
      let originHeight = this.height;
      // 最大尺寸限制
      const maxWidth = 600,
        maxHeight = 600;
      // 目标尺寸
      let targetWidth = originWidth,
        targetHeight = originHeight;
      // 图片尺寸超过限制
      if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > maxWidth / maxHeight) {
          // 更宽，按照宽度限定尺寸
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth * (originHeight / originWidth));
        } else {
          targetHeight = maxHeight;
          targetWidth = Math.round(maxHeight * (originWidth / originHeight));
        }
      }
      // canvas 对图片进行缩放
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      // 清除画布
      context.clearRect(0, 0, targetWidth, targetHeight);
      // 图片压缩
      context.drawImage(img, 0, 0, targetWidth, targetHeight);
      // canvas 转为 blob
      // 限制大小为 200k 左右
      const limit = 0.2 * 1024 * 1024;

      const canvasBlob = await new Promise((resolve, reject) => {
        // 兼容低版本浏览器内核
        if (!HTMLCanvasElement.prototype.toBlob) {
          Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function(callback, type, quality) {
              var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len);

              for (var i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i);
              }

              callback(new Blob([arr], { type: type || 'image/png' }));
            }
          });
        }

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type || 'image/png',
          // 'image/jpg',
          limit / file.size
        );
      });
      console.log('img.onload, canvasBlob', canvasBlob);
      resolve(canvasBlob);
    };
  });
};

/**
 * 通过 a 标签解析 url 标签
 * （已通过IE6-9 chrome  Firefox测试）
 * @param {String} url url 参数字符串，解析的目标
 */
export const parseURL = (url) => {
  //创建一个a标签
  const a = document.createElement('a');
  //将url赋值给标签的href属性。
  a.href = url;
  return {
    source: url,
    protocol: a.protocol.replace(':', ''), //协议
    host: a.hostname, //主机名称
    port: a.port, //端口
    query: a.search, //查询字符串
    params: (function() {
      //查询参数
      const ret = {};
      const seg = a.search.replace(/^\?/, '').split('&');
      const len = seg.length;
      let s;
      for (let i = 0; i < len; i++) {
        if (!seg[i]) {
          continue;
        }
        s = seg[i].split('=');
        ret[s[0]] = s[1];
      }
      return ret;
    })(),
    file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1], //文件名
    hash: a.hash.replace('#', ''), //哈希参数
    path: a.pathname.replace(/^([^\/])/, '/$1'), //路径
    relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1], //相对路径
    segments: a.pathname.replace(/^\//, '').split('/') //路径片段
  };
};

/**
 * 获取当前 url 中指定参数值
 * @param {String} key 查询参数名
 */
export const getUrlParam = (key) => {
  if (typeof key !== 'string') {
    return;
  }
  const urlSearchParams = new URLSearchParams(document.location.search);
  return urlSearchParams.get(key);
};

/**
 * 检测是否在 App 中的 Webview 打开
 */
export const openInWebview = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    // 微信浏览器判断
    return false;
  } else if (ua.match(/QQ/i) == 'qq') {
    // QQ浏览器判断
    return false;
  } else if (ua.match(/WeiBo/i) == 'weibo') {
    return false;
  } else {
    if (ua.match(/Android/i) != null) {
      return ua.match(/browser/i) == null;
    } else if (ua.match(/iPhone/i) != null) {
      return ua.match(/safari/i) == null;
    } else {
      return ua.match(/macintosh/i) == null && ua.match(/windows/i) == null;
    }
  }
};
