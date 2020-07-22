// import Logger from '~/src/library/logger'
import * as _ from 'lodash'
import * as dateFns from 'date-fns'
import * as md5 from 'md5'

const MD5_SALT = '1111111111111111111111111111'

function encodeBase64 (content:string) {
  return Buffer.from(content).toString('base64')
}

function decodeBase64 (encodeStr) {
  return Buffer.from(encodeStr, 'base64').toString()
}

function generateChecksum (content) {
  const hash1 = md5(content + MD5_SALT)
  return md5(MD5_SALT + hash1)
}

/**
 * 解析cookie中的token字段, 返回用户信息, 没有登录返回空对象
 * @param {Object} cookie
 * @return {Object}
 */
function parseToken (token:any) {
  const jsonInfo = decodeBase64(token)

  let info:any = {}
  try {
    info = JSON.parse(jsonInfo)
  } catch (e) {
    // Logger.log('info信息不是标准json')
    return {}
  }
  const checksum = generateChecksum(info.user)
  if (checksum !== info.checksum) {
    return {}
  }

  const user = JSON.parse(info.user)

  const ucid = _.get(user, ['ucid'], 0)
  const name = _.get(user, ['name'], '')
  const account = _.get(user, ['account'], '')
  const loginAt = _.get(user, ['loginAt'], 0)
  return {
    ucid,
    name,
    account,
    loginAt
  }
}

/**
 * 生成 cookie token
 * @param {*} ucid
 * @param {*} nickname
 * @param {*} account
 * @return {String}
 */
function generateToken (ucid, account, nickname) {
  const loginAt = dateFns.getUnixTime(new Date())
  const user = JSON.stringify({
    ucid,
    nickname,
    account,
    loginAt
  })
  // 利用checksum和loginAt避免登录信息被篡改
  const checksum = generateChecksum(user)
  const infoJson = JSON.stringify({
    user,
    checksum
  })
  const info = encodeBase64(infoJson)
  return info
}

export default {
  parseToken,
  generateToken
}
