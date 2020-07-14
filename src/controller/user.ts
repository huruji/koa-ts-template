import { Context } from 'koa';

class UserController {
  static register = async (ctx: Context):Promise<void> => {
    const data = await ctx.Services.UserService.register(ctx)
    ctx.body = {
      code: 200,
      message: 'success',
      ...data
    }
  };
}

export default UserController
