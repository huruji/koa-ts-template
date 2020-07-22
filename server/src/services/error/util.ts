import * as _ from 'lodash'
import * as moment from 'moment'

import { Context } from 'koa'
import DATE_FORMAT from '../../util/date_format'

const BASE_TABLE_NAME = 't_r_error_summary'

export function getRedisKey(baseKey, projectId, timeAt) {
  return baseKey + '_' + projectId + '_' + moment.unix(timeAt).format('YYYY-MM-DD');
}

/**
 * 获取数据库时间格式字符串
 * @param {*} startAt
 * @param {*} endAt
 * @param {*} type
 */
export function getDatabaseTimeList(startAt, endAt, type) {
  const countAtTimeList = [];
  let startMoment;
  let endMoment;
  let dateBaseFormat;
  let timeStep = 3600;
  switch (type) {
    case DATE_FORMAT.UNIT.MINUTE:
      dateBaseFormat = DATE_FORMAT.DATABASE_BY_MINUTE;
      timeStep = 60;
      break;
    case DATE_FORMAT.UNIT.HOUR:
      dateBaseFormat = DATE_FORMAT.DATABASE_BY_HOUR;
      timeStep = 3600;
      break;
    case DATE_FORMAT.UNIT.DAY:
      dateBaseFormat = DATE_FORMAT.DATABASE_BY_DAY;
      timeStep = 86400;
      break;
    default:
      return [];
  }
  startMoment = moment.unix(startAt).startOf(type);
  endMoment = moment.unix(endAt).endOf(type);
  for (let timeAt = startMoment.unix(); timeAt <= endMoment.unix(); timeAt += timeStep) {
    const time = moment.unix(timeAt).format(dateBaseFormat);
    countAtTimeList.push(time);
  }
  return countAtTimeList;
}

/**
 * 补全按时间分布的数据列表, 依照记录中index字段进行补全, 记录不存在则使用defaultRecord进行填充, index必须为时间戳
 * @param {*} rawRecordList
 * @param {*} startAt
 * @param {*} endAt
 * @param {*} countType
 * @param {*} defaultRecord
 */
export function paddingTimeList (rawRecordList, startAt, endAt, countType, defaultRecord = {}) {
  const resultList = []
  const startMoment = moment.unix(startAt).startOf(countType)
  const endMoment = moment.unix(endAt).endOf(countType)
  let timeStep
  const recordMap = {}
  switch (countType) {
    case DATE_FORMAT.UNIT.MINUTE:
      timeStep = 60
      break
    case DATE_FORMAT.UNIT.HOUR:
      timeStep = 3600
      break
    case DATE_FORMAT.UNIT.DAY:
      timeStep = 86400
      break
    default:
      return []
  }
  for (const rawRecord of rawRecordList) {
    const indexAt = _.get(rawRecord, ['index'], 0)
    recordMap[indexAt] = rawRecord
  }
  for (let timeAt = startMoment.unix(); timeAt <= endMoment.unix(); timeAt += timeStep) {
    const placeholderRecord = { ...defaultRecord, 'index': timeAt }
    const record = _.get(recordMap, [timeAt], placeholderRecord)
    resultList.push(record)
  }
  return resultList
}

/**
 * 获取表名
 * @param {number} projectId 项目id
 * @param {number} createTimeAt 创建时间, 时间戳
 * @return {String}
 */
export function getTableName(projectId, createTimeAt) {
  const DATE_FORMAT = 'YYYYMM';
  const YmDate = moment.unix(createTimeAt).format(DATE_FORMAT);
  return BASE_TABLE_NAME + '_' + projectId + '_' + YmDate;
}

export function getQueryParam(ctx:Context) {
  const projectId = ctx.params.id;
  let startAt = ctx.query.start_at || 0;
  let endAt = ctx.query.end_at || 0;
  const url = ctx.query.url || '';
  const currentPage = ctx.query.current_page || 1;
  const errorNameListJson = ctx.query.error_name_list_json || '[]';
  let errorNameList = [];
  try {
    errorNameList = JSON.parse(errorNameListJson);
  } catch (error) {
    errorNameList = [];
  }
  // 提供默认值
  if (startAt <= 0) {
    startAt = moment().startOf(DATE_FORMAT.UNIT.DAY).unix();
  }
  if (endAt <= 0) {
    endAt = moment().endOf(DATE_FORMAT.UNIT.DAY).unix();
  }

  return {
    projectId,
    startAt,
    endAt,
    currentPage,
    url,
    errorNameList
  }
}
