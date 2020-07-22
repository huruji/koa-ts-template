import { Context, Middleware } from 'koa';

class ProjectController {
  static list:Middleware = async (ctx: Context):Promise<void> => {
    const data = await ctx.Services.ProjectService.list(ctx)
    ctx.body = {
      code: 200,
      msg: 'success',
      action: 'success',
      ...data
    }
  };

}

export default ProjectController
