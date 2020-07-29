import { SDK as Core } from './index';

export default class ErrorTrack {
  core: Core;
  constructor (core: Core) {
    this.core = core;

    const _originOnerror = window.onerror;
    window.onerror = (...arg) => {
      const [message, source, line, column, error] = arg;
      this.core.log.apply(this.core, ['onerror', ...arg])
      // 恢复 window.onerror, 防止复写
      if (typeof _originOnerror === 'function') _originOnerror.apply(window, arg);
      this.core.report({
        type: 'onerror',
        message,
        source,
        line,
        column,
        error
      })
    };

    // 没有被 catch 的 promise 错误
    window.addEventListener('unhandledrejection', (...arg) => {
      this.core.log.apply(this.core, ['unhandledrejection', ...arg])
      const [message] = arg;
      this.core.report({
        type: 'unhandledrejection',
        message
      })
    });
  }
}



