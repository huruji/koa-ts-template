import { hash, parseAccountToUcid } from '../util/index';

import Auth from '../util/auth'
import { Context } from 'koa';
import apiRes from '../util/api-res';
import { get } from 'lodash';
import to from 'await-to-js';

const DEFAULT_AVATAR_URL = 'http://ww1.sinaimg.cn/large/00749HCsly1fwofq2t1kaj30qn0qnaai.jpg';

const { showError, showResult } = apiRes;

class User {
  static register = async (ctx: Context) => {
    const { body: { account, password, nickname } = {} } = ctx.request;
    const { UserModel } = ctx.Model;
    const data = await UserModel.findOne({
      where: {
        account,
      }
    });
    if (data) {
      return showError('账号已存在');
    }
    const parseAccount = parseAccountToUcid(account);
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
    const [err] = await to(UserModel.create(userInfo));
    if (err) {
      return showError('注册失败');
    }
    return showResult([], '注册成功');
  };

  static login = async (ctx: Context) => {
    const { body: { account, password } } = ctx.request;
    const { UserModel } = ctx.Model;
    const [err, rawUser] = await to(UserModel.findOne({
      where: {
        account,
      }
    }));
    if (err) {
      return showError('服务器错误');
    }
    if (!account) {
      return showError('未注册');
    }
    const savePassword = get(rawUser, ['password_md5'], '');
    const passwordMd5 = hash(password);
    if (savePassword === passwordMd5) {
      const nickname = get(rawUser, ['nickname'], '');
      const ucid = get(rawUser, ['ucid'], '');
      const avatarUrl = get(rawUser, ['avatar_url'], DEFAULT_AVATAR_URL);
      const registerType = get(rawUser, ['register_type'], 'site');
      const token = Auth.generateToken(ucid, account, nickname);

      ctx.cookies.set('fee_token', token, { maxAge: 100 * 86400 * 1000, httpOnly: false });
      ctx.cookies.set('ucid', ucid, { maxAge: 100 * 86400 * 1000, httpOnly: false });
      ctx.cookies.set('nickname', nickname, { maxAge: 100 * 86400 * 1000, httpOnly: false });
      ctx.cookies.set('account', account, { maxAge: 100 * 86400 * 1000, httpOnly: false });
      return showResult({ ucid, nickname, account, avatarUrl, registerType }) || {}
    }
    return showError('密码错误')
  };
}

export default User;
