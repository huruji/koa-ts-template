import ErrorTrack from './error'
import Performance from './performance'
import Request from './request'
import VisitPV from './pv'
import VisitUV from './uv'

interface IConfig {
  pid: number,
  reportUrl?: string,
  debug?: boolean
}


export class SDK {
  config: IConfig
  performance: Performance
  errorTrack: ErrorTrack
  request: Request
  report: Request['report']
  pv: VisitPV
  uv: VisitUV
  constructor() {
  }

  init(config:IConfig = {
    pid: 0,
    reportUrl: '',
    debug: false
  }):void {
    this.config = config
    this.request = new Request({
      url: 'http://mov.com/report'
    })
    this.report = this.request.report
    this.performance = new Performance(this)
    this.errorTrack = new ErrorTrack(this)
    this.pv = new VisitPV(this)
    this.uv = new VisitUV(this)
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.performance.getPerformanceInfo()
      })
    })
  }

  log(...arg:string[]):void {
    if(this.config.debug) {
      console.log(...arg)
    }
  }
}

export default new SDK();
