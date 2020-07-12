import * as Router from 'koa-router'

const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = 'Hello World'
})

export default router.routes()
