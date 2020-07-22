// import Knex from '~/src/library/mysql'
// import Logger from '~/src/library/logger'
import * as _ from 'lodash'
import * as dateFns from 'date-fns'
import * as md5 from 'md5'

const MD5_SALT = '12345678901234567890123'
const DEFAULT_PASSWORD = 'kehaolea'

const ROLE_DEV = 'dev'
const ROLE_ADMIN = 'admin'

const REGISTER_TYPE_THIRD = 'third'
const REGISTER_TYPE_SITE = 'site'

const DEFAULT_AVATAR_URL = 'http://ww1.sinaimg.cn/large/00749HCsly1fwofq2t1kaj30qn0qnaai.jpg'

const BASE_TABLE_NAME = 't_o_user'
const TABLE_COLUMN = [
  `id`,
  `ucid`,
  `account`,
  `email`,
  `password_md5`,
  `nickname`,
  `role`,
  `register_type`,
  `avatar_url`,
  `mobile`,
  `is_delete`,
  `create_time`,
  `update_time`
]

/**
 * 对外展示的字段
 */
const DISPLAY_TABLE_COLUMN = [
  `ucid`,
  `account`,
  `email`,
  `nickname`,
  `role`,
  `register_type`,
  `avatar_url`,
  `mobile`
]

/**
 * 加密字符串
 * @param {*} content
 */
function hash (content) {
  const v1ResultMd5 = md5(`${content}_${MD5_SALT}`)
  const v2ResultMd5 = md5(`${v1ResultMd5}_${MD5_SALT}`)
  const v3ResultMd5 = md5(`${v2ResultMd5}_${MD5_SALT}`)
  return v3ResultMd5
}

function getTableName () {
  return BASE_TABLE_NAME
}

// /**
//  * 创建用户
//  * @param {object} userInfo
//  */
// async function register (account, userInfo) {
//   const tableName = getTableName()
//   // 没有ucid,则把account转为ucid
//   const parseAccount = parseAccountToUcid(account)
//   const ucid = _.get(userInfo, ['ucid'], parseAccount)
//   const email = _.get(userInfo, ['email'], '')
//   const passwordMd5 = _.get(userInfo, ['password_md5'], hash(DEFAULT_PASSWORD))
//   const nickname = _.get(userInfo, ['nickname'], '')
//   const role = _.get(userInfo, ['role'], ROLE_DEV)
//   const registerType = _.get(userInfo, ['register_type'], REGISTER_TYPE_THIRD)
//   const mobile = _.get(userInfo, ['mobile'], '')
//   const avatarUrl = _.get(userInfo, ['avatarUrl'], DEFAULT_AVATAR_URL)
//   // ucid和account不能为空
//   if (ucid.length === 0 || account === '') {
//     return false
//   }

//   const nowAt = dateFns.getUnixTime(new Date())
//   const insertData = {
//     ucid,
//     account,
//     email,
//     password_md5: passwordMd5,
//     nickname,
//     role,
//     register_type: registerType,
//     avatar_url: avatarUrl,
//     mobile,
//     is_delete: 0,
//     create_time: nowAt,
//     update_time: nowAt
//   }
//   // 若用户已存在就直接更新
//   const existUserByAccount = await getByAccount(account)

//   // 检查account
//   if (_.isEmpty(existUserByAccount) === false) {
//     if (existUserByAccount.is_delete) {
//       const updateResult = await update(existUserByAccount.ucid, insertData)
//       return updateResult
//     } else {
//       return true
//     }
//   }

//   // 检查ucid
//   const existUserByUcid = await getByAccount(ucid)
//   if (_.isEmpty(existUserByUcid) === false) {
//     if (existUserByUcid.is_delete) {
//       const updateResult = await update(existUserByUcid.ucid, insertData)
//       return updateResult
//     } else {
//       return true
//     }
//   }

//   const insertResult = await Knex
//     .returning('id')
//     .insert(insertData)
//     .into(tableName)
//     .catch(e => { return [] })
//   const insertId = _.get(insertResult, [0], 0)
//   return insertId > 0
// }

// /**
//  * 获取用户信息
//  * @param {String} ucid
//  */
// async function get (ucid) {
//   const tableName = getTableName()

//   const result = await Knex
//     .select(TABLE_COLUMN)
//     .from(tableName)
//     .where('ucid', ucid)
//   const user = _.get(result, [0], {})
//   return user
// }

// /**
//  * 根据账户获取用户信息
//  * @param {String} account
//  * @return {Object}
//  */
// async function getByAccount (account) {
//   const tableName = getTableName()

//   const result = await Knex
//     .select(TABLE_COLUMN)
//     .from(tableName)
//     .where('account', account)
//   const user = _.get(result, [0], {})
//   return user
// }

// /**
//  * 根据账户获取网站注册用户（普通用户）的信息
//  * @param {String} account
//  * @return {Object}
//  */
// async function getSiteUserByAccount (account) {
//   const tableName = getTableName()

//   const result = await Knex
//     .select(TABLE_COLUMN)
//     .from(tableName)
//     .where('account', account)
//     .andWhere('register_type', REGISTER_TYPE_SITE)
//   const user = _.get(result, [0], {})
//   return user
// }
// /**
//  * 根据账户名搜索用户列表
//  * @param {*} account
//  * @param {*} offset
//  * @param {*} max
//  */
// async function searchByAccount (account, offset = 0, max = 10) {
//   const tableName = getTableName()
//   const rescordList = await Knex
//     .select(TABLE_COLUMN)
//     .from(tableName)
//     .where('is_delete', '=', 0)
//     .andWhere('account', 'like', `%${account}%`)
//     .limit(max)
//     .offset(offset)
//   return rescordList
// }

// /**
//  * 用户列表
//  * @param {number} offset    获取数据的偏移量
//  * @param {number} max       一页最多展示的数据
//  */
// async function getList (offset = 0, max = 10) {
//   const tableName = getTableName()
//   const result = await Knex
//     .select(TABLE_COLUMN)
//     .from(tableName)
//     .limit(max)
//     .offset(offset)
//     .where('is_delete', '=', 0)
//   return result
// }

// /**
//  * 更新记录
//  * @param {number} id
//  * @param {object} rawUpdateData = {}
//  */
// async function update (ucid, rawUpdateData) {
//   const nowAt = dateFns.getUnixTime(new Date())

//   const updateRecord = {}
//   for (const key of [
//     'email',
//     'password_md5',
//     'nickname',
//     'role',
//     'register_type',
//     'avatar_url',
//     'mobile',
//     'is_delete'
//   ]) {
//     if (_.has(rawUpdateData, [key])) {
//       updateRecord[key] = rawUpdateData[key]
//     }
//   }

//   updateRecord['update_time'] = nowAt
//   const tableName = getTableName()
//   const affectRows = await Knex(tableName)
//     .update(updateRecord)
//     .where('ucid', ucid)
//   return affectRows > 0
// }

// /**
//  * 根据memberid获取member信息
//  * @param {*} memberIdList
//  */
// async function getUserListByUcid (memberUcidList) {
//   const tableName = getTableName()
//   const result = await Knex
//     .select(TABLE_COLUMN)
//     .from(tableName)
//     .whereIn('ucid', memberUcidList)
//     .catch(err => {
//       Logger.log(err.message, 'getMemberListByUcid出错')
//       return []
//     })
//   return result
// }

/**
 * 检查用户身份是否是管理员
 * @param {*} ucid
 */
async function isAdmin (user:any) {
  const isExist = _.get(user, ['is_delete'], 1) === 0
  const isAdmin = _.get(user, ['role'], ROLE_DEV) === ROLE_ADMIN
  if (isExist && isAdmin) {
    return true
  }
  return false
}

function formatRecord (rawItem) {
  const item = {}
  for (const key of DISPLAY_TABLE_COLUMN) {
    if (_.has(rawItem, [key])) {
      item[key] = rawItem[key]
    }
  }
  return item
}

// function parseAccountToUcid (account) {
//   let ucid = ''
//   let accountMd5 = md5(account)
//   accountMd5 = accountMd5.slice(0, 16)
//   for (let index = 0; index < accountMd5.length; index++) {
//     ucid += accountMd5.charCodeAt(index)
//   }
//   return ucid
// }
export default {
  // hash,
  // register,
  // get,
  // getByAccount,
  // getSiteUserByAccount,
  // getList,
  // searchByAccount,
  // update,
  // // 根据ucid获取用户信息（名字，id等）
  // getUserListByUcid,

  isAdmin,

  formatRecord,

  getTableName,

  DEFAULT_AVATAR_URL,
  REGISTER_TYPE_SITE,
  REGISTER_TYPE_THIRD,
  ROLE_ADMIN,
  ROLE_DEV
}
