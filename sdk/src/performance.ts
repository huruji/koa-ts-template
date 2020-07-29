import { SDK as Core } from './index';
/**
 * 页面性能监控
 */

class Performance {
  core: Core;
  constructor (core: Core) {
    this.core = core;
  }
  getPerformanceInfo():void {
    const performance = window.performance;
    if (!performance) {
      this.core.log('你的浏览器不支持 performance 接口');
      return;
    }
    const times = performance.timing.toJSON();
    this.core.log('performance timing', times)
    this.core.report(times)
  }
}
export default Performance;
