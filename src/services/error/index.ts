import * as _ from 'lodash';
import * as moment from 'moment';

import { Op, col, fn } from 'sequelize';
import { getDatabaseTimeList, getQueryParam, getRedisKey, getTableName, paddingTimeList } from './util';
import { hash, parseAccountToUcid } from '../../util/index';

import Auth from '../../util/auth';
import { Context } from 'koa';
import DATE_FORMAT from '../../util/date_format';
import { ErrorController } from '../../controller';
import ErrorSummay from '../../model/error-summary';
import apiRes from '../../util/api-res';
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

class Error {
  static summary = async (ctx: Context) => {
    const projectId = ctx.params.id;
    let {
      start_at: startAt,
      end_at: endAt
    } = ctx.query;
    startAt = moment.unix(startAt).startOf(DATE_FORMAT.UNIT.DAY).unix();
    endAt = moment.unix(endAt).endOf(DATE_FORMAT.UNIT.DAY).unix();

    const errorList = await Error.getErrorNameDistributionByTimeWithCache(projectId, startAt, endAt);
    return showResult(errorList);
  };

  static urlDistribution = async (ctx: Context) => {
    const {
      projectId,
      startAt,
      endAt,
      errorNameList
    } = getQueryParam(ctx);
    const countType = DATE_FORMAT.UNIT.DAY;

    const rawDistributionList = await Error.getUrlPathDistributionListByErrorNameList(projectId, startAt, endAt, errorNameList, countType, 10);
    const distributionList = [];
    for (const rawDistribution of rawDistributionList) {
      const { url_path: url, error_count: errorCount } = rawDistribution;
      const record = {
        name: url,
        value: errorCount
      };
      distributionList.push(record);
    }
    return showResult(distributionList);
  };

  static stackArea = async (ctx: Context) => {
    const {
      projectId,

      url,
      errorNameList
    } = getQueryParam(ctx);
    let {
      startAt,
      endAt,
    } = getQueryParam(ctx);
    let countType = ctx.query.count_type || DATE_FORMAT.UNIT.HOUR;
    let displayFormatTpl = 'MM-DD HH:mm:ss';
    switch (countType) {
      case DATE_FORMAT.UNIT.MINUTE:
        displayFormatTpl = 'D日HH点mm分';
        break;
      case DATE_FORMAT.UNIT.HOUR:
        displayFormatTpl = 'D日HH点';
        break;
      case DATE_FORMAT.UNIT.DAY:
        displayFormatTpl = 'MM-DD';
        break;
      default:
        countType = DATE_FORMAT.UNIT.HOUR;
        displayFormatTpl = 'D日HH点';
    }
    startAt = moment.unix(startAt).startOf(countType).unix();
    endAt = moment.unix(endAt).endOf(countType).unix();

    const rawRecordList = await Error.getStackAreaDistribution(projectId, startAt, endAt, countType, errorNameList, url);

    const errorDistributionMap = {};
    for (const rawRecord of rawRecordList) {
      const errorName = _.get(rawRecord, ['error_name'], '');
      const errorCount = _.get(rawRecord, ['error_count'], 0);
      const countAtTime = _.get(rawRecord, ['count_at_time'], '');

      const countAt = moment(countAtTime, DATE_FORMAT.DATABASE_BY_UNIT[countType]).unix();
      const record = {
        index: countAt,
        name: errorName,
        value: errorCount
      };

      if (_.has(errorDistributionMap, [errorName])) {
        errorDistributionMap[errorName].push(record);
      } else {
        errorDistributionMap[errorName] = [record];
      }
    };

    let rawStackAreaRecordList = [];
    const stackAreaRecordList = [];

    for (const errorName of Object.keys(errorDistributionMap)) {
      const rawRecordList = errorDistributionMap[errorName];
      const paddingResultList = paddingTimeList(rawRecordList, startAt, endAt, countType, {
        name: errorName,
        value: 0
      });
      // 补全后添加到最终结果中
      rawStackAreaRecordList = rawStackAreaRecordList.concat(paddingResultList);
    }

    // 时间格式化
    for (const rawStackAreaRecord of rawStackAreaRecordList) {
      const index = _.get(rawStackAreaRecord, ['index'], 0);
      const formatedIndex = moment.unix(index).format(displayFormatTpl);
      const stackAreaRecord = {
        ...rawStackAreaRecord,
        index_display: formatedIndex
      };
      stackAreaRecordList.push(stackAreaRecord);
    }

    // 按时间顺序排序
    stackAreaRecordList.sort((a, b) => a['index'] - b['index']);
    return showResult(stackAreaRecordList);
  };

  static errorName = async (ctx: Context) => {
    const {
      projectId,
      startAt,
      endAt,
      url,
      errorNameList
    } = getQueryParam(ctx);
    const countType = DATE_FORMAT.UNIT.DAY;

    const rawDistributionList = await Error.getErrorNameDistributionListInSameMonth(projectId, startAt, endAt, countType, errorNameList, url);
    const distributionList = [];
    for (const rawDistribution of rawDistributionList) {
      const { error_count: errorCount, error_name: errorName } = rawDistribution;
      const distribution = {
        name: errorName,
        value: errorCount
      };
      distributionList.push(distribution);
    }
    return showResult(distributionList);
  };

  static errorList = async (ctx: Context) => {
    const {
      projectId,
      startAt,
      endAt,
      errorNameList,
      url,
      currentPage
    } = getQueryParam(ctx);
    const offset = (currentPage - 1) * 10;

    const errorCount = await Error.getTotalCountByConditionInSameMonth(projectId, startAt, endAt, offset, 10, errorNameList, url);
    // const errorList = await MMonitor.getListByConditionInSameMonth(projectId, startAt, endAt, offset, PAGE_SIZE, errorNameList, url);

    // const pageData = {
    //   pager: {
    //     current_page: currentPage,
    //     page_size: 10,
    //     total: errorCount
    //   },
    //   list: errorList
    // };

    // return showResult(pageData)
  };

  static errorGeography = async (ctx: Context) => {
    const {
      projectId,
      startAt,
      endAt,
      url,
      errorNameList
    } = getQueryParam(ctx);

    const countType = DATE_FORMAT.UNIT.DAY;

    // const rawRecordList = await MErrorSummary.getList(projectId, startAt, endAt, countType, errorNameList, url);
    // const resultList = [];
    // const distributionMap = {};

    // for (const rawRecord of rawRecordList) {
    //   const cityDistribution = _.get(rawRecord, ['city_distribution'], {});
    //   // 按省份进行统计
    //   for (const country of Object.keys(cityDistribution)) {
    //     const provinceMap = _.get(cityDistribution, [country], {});
    //     for (const province of Object.keys(provinceMap)) {
    //       const cityMap = _.get(provinceMap, [province], {});
    //       for (const city of Object.keys(cityMap)) {
    //         const errorCount = _.get(cityMap, [city], 0);
    //         if (_.has(distributionMap, [province])) {
    //           distributionMap[province] = distributionMap[province] + errorCount;
    //         } else {
    //           distributionMap[province] = errorCount;
    //         }
    //       }
    //     }
    //   }
    // }
    // // 只显示国内省份
    // for (const province of PROVINCE_LIST) {
    //   const errorCount = _.get(distributionMap, [province], 0);
    //   resultList.push({
    //     name: province,
    //     value: errorCount
    //   });
    // }
    // resultList.sort((a, b) => b['value'] - a['value']);
    // res.send(API_RES.showResult(resultList));
  };

  static getTotalCountByConditionInSameMonth = async function getTotalCountByConditionInSameMonth(projectId, startAt, endAt, offset = 0, max = 10, errorNameList = [], url = '') {
    const tableName = getTableName(projectId, startAt);
    const res = await ErrorSummay(tableName).count({
      where: {
        log_at: {
          [Op.gt]: startAt,
          [Op.lt]: endAt
        },
        url: {
          [Op.like]: `%${url}%`
        }
      }
    });
    const totalCount = _.get(res, [0, 'total_count'], 0);
    return totalCount;
  };
  /**
 * 获取指定error_name中的错误分布数, 或指定url下, 指定errorNameList下的错误分布数
 * @param {*} projectId
 * @param {*} startAt
 * @param {*} endAt
 * @param {*} countType
 * @param {*} errorNameList
 * @param {*} url
 */
  static getErrorNameDistributionListInSameMonth = async function getErrorNameDistributionListInSameMonth(projectId, startAt, endAt, countType, errorNameList = [], url = '') {
    const tableName = getTableName(projectId, startAt);
    const timeList = getDatabaseTimeList(startAt, endAt, countType);
    const extendCondition = {};
    if (url.length > 0) {
      extendCondition['url_path'] = url;
    }
    const res = await ErrorSummay(tableName).findAll({
      attributes: [
        'error_name',
        [fn('sum', col('error_count')), 'sum_error_count']
      ],
      where: {
        error_name: errorNameList,
        count_type: countType,
        count_at_time: timeList,
        ...extendCondition,
      },
      order: [col('sum_error_count')],
      group: ['error_name']
    });
    const recordList = [];
    for (const rawRecord of res) {
      const item = JSON.parse(JSON.stringify(rawRecord));
      const { sum_error_count: errorCount, error_name: errorName } = item;
      const record = {
        error_count: errorCount,
        error_name: errorName
      };
      recordList.push(record);
    }

    return recordList;
  };

  static getStackAreaDistribution = async function getStackAreaDistribution(projectId, startAt, endAt, countType, errorNameList = [], url = '') {
    const tableName = getTableName(projectId, startAt);
    const timeList = getDatabaseTimeList(startAt, endAt, countType);
    const extendCondition = {};
    if (url.length > 0) {
      extendCondition['url_path'] = url;
    }

    const res = await ErrorSummay(tableName).findAll({
      attributes: [
        'error_name',
        'count_at_time',
        [fn('sum', col('error_count')), 'sum_error_count']
      ],
      where: {
        ...extendCondition,
        count_type: countType,
        count_at_time: timeList,
        error_name: errorNameList
      },
      group: ['count_at_time', 'error_name']
    });
    const recordList = [];
    for (const rawRecord of res) {
      const { error_name: errorName, count_at_time: countAtTime, sum_error_count: sumErrorCount } = JSON.parse(JSON.stringify(rawRecord));
      const record = {
        error_name: errorName,
        count_at_time: countAtTime,
        error_count: sumErrorCount
      };
      recordList.push(record);
    }
    return recordList;
  };
  static getUrlPathDistributionListByErrorNameList = async (projectId, startAt, endAt, errorNameList, countType, max = 10) => {
    const tableName = getTableName(projectId, startAt);
    const countAtTimeList = getDatabaseTimeList(startAt, endAt, countType);
    const res = await ErrorSummay(tableName).findAll({
      attributes: [
        'url_path',
        [fn('sum', col('error_count')), 'total_count']
      ],
      where: {
        error_name: errorNameList,
        count_at_time: countAtTimeList,
        count_type: countType
      },
      order: col('total_count'),
      group: 'url_path',
      limit: max
    });
    const recordList = [];
    for (const rawRecord of res) {
      const item = JSON.parse(JSON.stringify(rawRecord));
      const urlPath = _.get(item, ['url_path'], '');
      const errorCount = _.get(item, ['total_count'], 0);
      const record = {
        url_path: urlPath,
        error_count: errorCount
      };
      recordList.push(record);
    }
    return recordList;
  };

  /**
 * 从缓存中获取最近指定时间范围内的错误数分布, 缓存不存在则重新查询
 * @param {*} projectId
 * @param {*} forceUpdate 是否强制更新缓存
 */
  static getErrorNameDistributionByTimeWithCache = async (projectId, startAt, endAt, forceUpdate = false) => {
    const distributionList: any[] = [];
    const distributionMap: any = {};
    for (let timeAt = startAt; timeAt <= endAt; timeAt += 86400) {
      const key = getRedisKey(REDIS_KEY_ERROR_NAME_DISTRIBUTION_CACHE, projectId, timeAt);
      let redisDistributionList = await redis.asyncGet<any[]>(key);

      if (_.isEmpty(redisDistributionList) || forceUpdate) {
        redisDistributionList = await Error.getErrorNameDistributionInSameMonth(projectId, moment.unix(timeAt).startOf('day').unix(), moment.unix(timeAt).endOf('day').unix());
        await redis.asyncSetex(key, 86400, redisDistributionList);
      }
      for (let i = 0; i < redisDistributionList.length; i++) {
        const item = redisDistributionList[i];
        if (distributionMap[item.error_name]) {
          distributionMap[item.error_name] += item.error_count;
        } else {
          distributionMap[item.error_name] = item.error_count;
        }
      }
    }
    for (const [key, value] of Object.entries(distributionMap)) {
      distributionList.push({
        error_name: key,
        error_count: value
      });
    }

    return distributionList;


    // let tableName = getTableName(projectId, startAt)
    // let timeList = getDatabaseTimeList(startAt, endAt, DATE_FORMAT.UNIT.DAY)

  };
  /**
   * 获取时间范围内, 报错数最多的前max个errorName
   * @param {*} projectId
   * @param {*} startAt
   * @param {*} endAt
   * @return {Array}
   */
  static getErrorNameDistributionInSameMonth = async function getErrorNameDistributionInSameMonth(projectId, startAt, endAt, max = 500): Promise<any[]> {
    const tableName = getTableName(projectId, startAt);
    const timeList = getDatabaseTimeList(startAt, endAt, DATE_FORMAT.UNIT.DAY);
    const res = await ErrorSummay(tableName).findAll({
      attributes: [
        'error_name',
        [fn('sum', col('error_count')), 'sum_error_count']
      ],
      where: {
        count_at_time: timeList,
        count_type: 'day'
      },
      order: col('sum_error_count'),
      group: 'error_name'
    });
    const distributionList = [];
    for (const error of res) {
      const item = JSON.parse(JSON.stringify(error));
      distributionList.push({
        error_name: item.error_name || '',
        error_count: item.sum_error_count || 0
      });
    }
    return distributionList;
  };
}

export default Error;
