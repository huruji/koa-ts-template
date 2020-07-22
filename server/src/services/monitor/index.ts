import * as _ from 'lodash';
import * as moment from 'moment';

import { Op, col, fn } from 'sequelize';
import { hash, parseAccountToUcid } from '../../util/index';

import Auth from '../../util/auth';
import { Context } from 'koa';
import DATE_FORMAT from '../../util/date_format';
import { ErrorController } from '../../controller';
import MonitorModel from '../../model/monitor';
import apiRes from '../../util/api-res';
import { getQueryParam } from '../error/util'
import { getTableName } from './util';
import projectUtil from '../../util/project';
import redis from '../../lib/redis';
import sequelize from '../../config/db';
// import sequelize from '../config/db'
import to from 'await-to-js';
import userUtil from '../../util/user';

const BASE_TABLE_NAME = 't_r_error_summary';
const MAX_LIMIT = 100;

const BASE_REDIS_KEY = 'error_summary';
const REDIS_KEY_ERROR_NAME_DISTRIBUTION_CACHE = BASE_REDIS_KEY + '_' + 'error_name_distribution_cache';
const DEFAULT_AVATAR_URL = 'http://ww1.sinaimg.cn/large/00749HCsly1fwofq2t1kaj30qn0qnaai.jpg';

const { showError, showResult } = apiRes;

class Monitor {
  static errorList = async (ctx: Context) => {
    const {
      projectId,
      startAt,
      endAt,
      errorNameList,
      url,
      currentPage
    } = getQueryParam(ctx)
    const offset = (currentPage - 1) * 10;

    const errorCount = await Monitor.getTotalCountByConditionInSameMonth(projectId, startAt, endAt, offset, 10, errorNameList, url);
    const errorList = await Monitor.getListByConditionInSameMonth(projectId, startAt, endAt, offset, 10, errorNameList, url);

    const pageData = {
      pager: {
        current_page: currentPage,
        page_size: 10,
        total: errorCount
      },
      list: errorList
    };

    return showResult(pageData)
  };

  /**
 * 获取分页数据
 * @param {*} projectId
 * @param {*} startAt
 * @param {*} endAt
 * @param {*} offset
 * @param {*} max
 * @param {*} errorNameList
 * @param {*} url
 */
static getListByConditionInSameMonth = async function getListByConditionInSameMonth (projectId, startAt, endAt, offset = 0, max = 10, errorNameList = [], url = '') {
  const tableName = getTableName(projectId, startAt)
  // 获取最大id
  const res = await MonitorModel(tableName).count()

  if (res === 0) {
    return []
  }

  const rawRecordList = await MonitorModel(tableName).findAll({
    where: {
      log_at: {
        [Op.gt]: startAt,
        [Op.lt]: endAt
      },
      id: {
        [Op.gt]: res - 10000
      },
      error_name: errorNameList,
      url: {
        [Op.like]: `%${url}%`
      }
    },
    order: [col('log_at')],
    limit: 10,
    offset
  })

  return rawRecordList

  // const extendLogIdList = []
  // let createAt = 0
  // if (rawRecordList.length === 0) return []
  // for (const rawRecord of rawRecordList) {
  //   const extendRecordId = _.get(rawRecord, ['monitor_ext_id'], 0)
  //   // 所有记录一定在同一张扩展表里
  //   createAt = _.get(rawRecord, ['create_time'], 0)
  //   extendLogIdList.push(extendRecordId)
  // }
  // // 补全扩展信息
  // const extendRecordList = await MMonitorExt.getRecordListByIdList(projectId, createAt, extendLogIdList)
  // const extendRecordMap = {}
  // for (const extendRecord of extendRecordList) {
  //   const extJson = _.get(extendRecord, ['ext_json'], '{}')
  //   const extId = _.get(extendRecord, ['id'], '{}')
  //   let ext = {}
  //   try {
  //     ext = JSON.parse(extJson)
  //   } catch (e) {
  //     ext = {}
  //   }
  //   extendRecordMap[extId] = ext
  // }

  // // 填充到数据里
  // const recordList = []
  // for (const rawRecord of rawRecordList) {
  //   const extendRecordId = _.get(rawRecord, ['monitor_ext_id'], 0)
  //   const extendRecord = _.get(extendRecordMap, [extendRecordId], {})
  //   rawRecord['ext'] = extendRecord
  //   const record = {
  //     ...rawRecord
  //   }
  //   recordList.push(record)
  // }

  // const rawResult = await Knex
  //   .max('id as maxId')
  //   .from(tableName)
  //   .catch(err => {
  //     Logger.error('monitor.js => getListByConditionInSameMonth获取最大id出错', err.message)
  //     return [{ maxId: 0 }]
  //   })
  // const maxId = _.get(rawResult, [0, 'maxId'], 0)
  // if (maxId === null || maxId === 0) return []
  // const rawRecordList = await Knex
  //   .select(TABLE_COLUMN)
  //   .from(tableName)
  //   .where('log_at', '>', startAt)
  //   .andWhere('id', '>', maxId - MAX_ERROR_LOG_LENGTH)
  //   .andWhere('log_at', '<', endAt)
  //   .whereIn('error_name', errorNameList)
  //   .andWhere((builder) => {
  //     // 外部传入的url可能是去除get参数后的结果, 所以需要进行模糊匹配
  //     // @todo(yaozeyuan) 添加字段, 记录 页面真实地址, 以和url进行区分
  //     if (url.length > 0) {
  //       builder.where('url', 'like', `%${url}%`)
  //     }
  //   })
  //   .orderBy('log_at', 'desc')
  //   .offset(offset)
  //   .limit(max)
  //   .catch(e => {
  //     Logger.warn(e)
  //     return []
  //   })

  // const extendLogIdList = []
  // let createAt = 0
  // if (rawRecordList.length === 0) return []
  // for (const rawRecord of rawRecordList) {
  //   const extendRecordId = _.get(rawRecord, ['monitor_ext_id'], 0)
  //   // 所有记录一定在同一张扩展表里
  //   createAt = _.get(rawRecord, ['create_time'], 0)
  //   extendLogIdList.push(extendRecordId)
  // }
  // // 补全扩展信息
  // const extendRecordList = await MMonitorExt.getRecordListByIdList(projectId, createAt, extendLogIdList)
  // const extendRecordMap = {}
  // for (const extendRecord of extendRecordList) {
  //   const extJson = _.get(extendRecord, ['ext_json'], '{}')
  //   const extId = _.get(extendRecord, ['id'], '{}')
  //   let ext = {}
  //   try {
  //     ext = JSON.parse(extJson)
  //   } catch (e) {
  //     ext = {}
  //   }
  //   extendRecordMap[extId] = ext
  // }

  // // 填充到数据里
  // const recordList = []
  // for (const rawRecord of rawRecordList) {
  //   const extendRecordId = _.get(rawRecord, ['monitor_ext_id'], 0)
  //   const extendRecord = _.get(extendRecordMap, [extendRecordId], {})
  //   rawRecord['ext'] = extendRecord
  //   const record = {
  //     ...rawRecord
  //   }
  //   recordList.push(record)
  // }

  // return recordList
}

  static getTotalCountByConditionInSameMonth = async function getTotalCountByConditionInSameMonth(projectId, startAt, endAt, offset = 0, max = 10, errorNameList = [], url = '') {
    const tableName = getTableName(projectId, startAt)
    const res = await MonitorModel(tableName).count({
      where: {
        log_at: {
          [Op.gt]: +startAt,
          [Op.lt]: +endAt
        },
        url: {
          [Op.like]: `%${url}%`
        }
      }
    })
    return res
  }
}

export default Monitor;
