import * as Router from 'koa-router'

import ErrorController from './controller/error'
import ProjectController from './controller/project'
import UserController from './controller/user'

const router = new Router()

router.post('/api/user/register', UserController.register)
router.post('/api/login/normal', UserController.login)
router.get('/api/user/detail', UserController.userDetail)
router.get('/api/project/item/list', ProjectController.list)

router.get('/project/:id/api/error/distribution/summary', ErrorController.summary)
router.get('/project/:id/api/error/distribution/url', ErrorController.urlDistribution)
router.get('/project/:id/api/error/viser/area/stack_area', ErrorController.stackArea)
router.get('/project/:id/api/error/distribution/error_name', ErrorController.errorName)
router.get('/project/:id/api/error/log/list', ErrorController.errorList)
router.get('/project/:id/api/error/distribution/geography', ErrorController.errorGeography)

export default router.routes()
