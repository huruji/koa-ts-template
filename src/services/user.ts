import { hash, parseAccountToUcid } from '../util/index'

import { Context } from 'koa'
import { get } from 'lodash'
import to from 'await-to-js'

const DEFAULT_AVATAR_URL = 'http://ww1.sinaimg.cn/large/00749HCsly1fwofq2t1kaj30qn0qnaai.jpg'

class User {
  static register = async (ctx: Context) => {
    const { body: { account, password, nickname } = {} } = ctx.request;
    const { UserModel } = ctx.Model
    const data = await UserModel.findOne({
      where: {
        account,
      }
    })
    if (data) {
      return {
        code: 100,
        message: '账号已存在',
      }
    }
    const parseAccount = parseAccountToUcid(account)
    const userInfo = {
      ucid: parseAccount,
      account,
      email: account,
      password_md5: hash(password),
      nickname,
      register_type: 'site',
      role: 'admin',
      avatar_url: DEFAULT_AVATAR_URL,
      mobile: '',
      is_delete: 0,
      create_time: Date.now(),
      update_time: Date.now()
    };
    const [err] = await to(UserModel.create(userInfo))
    if(err) {
      return {
        code: 500,
        message: '服务器内部错误'
      }
    }
    return {
      data: {}
    }
  };
}

export default User;
