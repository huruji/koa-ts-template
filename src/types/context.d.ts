import { Context } from 'koa'
import * as Model from '../model'
import * as Services from '../services'

declare module "koa" {
  interface Context {
    Model: typeof Model
    Services: typeof Services
  }
}
