import * as Controller from './controller'
import * as Koa from 'koa'
import * as Model from './model'
import * as Services from './services'
import * as bodyParser from 'koa-bodyparser'
import * as cors from 'koa-cors'

import { basicConfig } from './config'
import routes from './routes'

const start = () => {
  const App = new Koa();

  App.context.Controller = Controller
  App.context.Model = Model
  App.context.Services = Services

  App.use(bodyParser());

  App.use(cors({
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: true,
  }));

  App.use(routes);

  App.listen(basicConfig.port, () => {
    console.log(`Server running on port ${basicConfig.port}`)
  });
};

start()

process.on('uncaughtException', err => {
  start()
})
