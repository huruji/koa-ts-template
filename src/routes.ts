import * as Router from 'koa-router'

import UserController from './controller/user'

const router = new Router()

router.post('/api/user/register', UserController.register)
router.post('/api/login/normal', UserController.login)

export default router.routes()
