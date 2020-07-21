import { Context, Middleware } from 'koa';

class ErrorController {
  static summary:Middleware = async (ctx: Context):Promise<void> => {
    const data = await ctx.Services.ErrorService.summary(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  }

  static urlDistribution:Middleware = async(ctx: Context):Promise<void> => {
    const data = await ctx.Services.ErrorService.urlDistribution(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  }

  static stackArea:Middleware = async(ctx:Context):Promise<void> => {
    const data = await ctx.Services.ErrorService.stackArea(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  }

  static errorName:Middleware = async(ctx:Context):Promise<void> => {
    const data = await ctx.Services.ErrorService.errorName(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  }

  static errorList:Middleware = async(ctx:Context):Promise<void> => {
    const data = await ctx.Services.MonitorService.errorList(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data,
    }
  }

  static errorGeography:Middleware = async(ctx: Context):Promise<void> => {
    const data = await ctx.Services.ErrorService.errorGeography(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data,
    }
  }
}

export default ErrorController
