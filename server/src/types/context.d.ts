import { Context } from 'koa'
import * as Model from '../model'
import * as Services from '../services'
import sequelize from '../config/db'

declare module "koa" {
  interface Context {
    Model: typeof Model
    Services: typeof Services
    sequelize: typeof sequelize
    params: Record<string, string>
  }
}
