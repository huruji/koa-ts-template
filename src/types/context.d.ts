import { Context } from 'koa'
import * as Model from '../model'

declare module "koa" {
  interface Context {
    Model: typeof Model
  }
}
