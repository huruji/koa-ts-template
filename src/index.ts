import * as Koa from 'koa'

import config from './config'
import routes from './routes'

const App = new Koa()

App.use(routes)

App.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
