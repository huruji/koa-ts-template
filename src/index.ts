import * as Controller from './controller'
import * as Koa from 'koa'
import * as Model from './model'
import * as Services from './services'
import * as bodyParser from 'koa-bodyparser'
import * as cors from 'koa-cors'
import * as log4js from 'koa-log4'

import { basicConfig } from './config'
import routes from './routes'
import sequelize from './config/db'

const start = () => {
  const App = new Koa();

  App.context.Controller = Controller
  App.context.Model = Model
  App.context.Services = Services
  App.context.sequelize = sequelize

  App
  .use(bodyParser())
  .use(cors({
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: true,
  }))
  .use(routes)
  .use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }))
  .listen(basicConfig.port, () => {
    console.log(`Server running on port ${basicConfig.port}`)
  });
};



start()

process.on('uncaughtException', err => {
  start()
})
