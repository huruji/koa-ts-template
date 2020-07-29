interface ReportOption {

}

class Request {
  url: string
  constructor(option: {
    url?: string
  } = {
    url: 'http://mov.com/report'
  }){
    this.url = option.url
  }

  report(option: ReportOption):void {
    const img = new Image();
    img.src = `${this.url}?val=${JSON.stringify(option)}`
  }
}

export default Request
