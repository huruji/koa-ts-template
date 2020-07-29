import { SDK as Core } from './index';

class VisitPV{
  core: Core
  constructor(core: Core){
    this.core = core
    this.init()
  }
  init():void {
    window.addEventListener('popstate', () => {
      this.core.report({
        type: 'pv',
        url: location.href
      })
    });
    const oldPushState = window.history.pushState
    window.history.pushState = (...args) => {
      setTimeout(() => {
        this.core.report({
          type: 'pv',
          url: location.href
        })
      })
      oldPushState.apply(window, args);
    }
  }
}

export default VisitPV
