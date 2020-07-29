import { SDK as Core } from './index';

const key = '_mov_first_in'

class VisitUV{
  core: Core
  constructor(core: Core){
    this.core = core
    this.init()
  }
  init():void {
    const isFirstIn = sessionStorage.getItem(key)
    if (!isFirstIn) {
      this.core.report({
        type: 'uv',
      })
      sessionStorage.setItem(key, true.toString())
    }
  }
}

export default VisitUV
