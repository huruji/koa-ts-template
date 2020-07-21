import { Context, Middleware } from 'koa';

class UserController {
  static register:Middleware = async (ctx: Context):Promise<void> => {
    const data = await ctx.Services.UserService.register(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  };

  static login:Middleware = async (ctx:Context) => {
    const data = await ctx.Services.UserService.login(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  }

  static userDetail:Middleware = async (ctx:Context) => {
    const data = await ctx.Services.UserService.getUserDetail(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  }
}

export default UserController
