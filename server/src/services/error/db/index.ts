import * as _ from 'lodash';
import * as moment from 'moment';

import { Op, col, fn } from 'sequelize';
import { getDatabaseTimeList, getQueryParam, getRedisKey, getTableName, paddingTimeList } from '../util';

import DATE_FORMAT from '@util/date_format';
import ErrorSummay from '@model/error-summary';
import redis from '../../../lib/redis';

const BASE_TABLE_NAME = 't_r_error_summary';
const MAX_LIMIT = 100;


const BASE_REDIS_KEY = 'error_summary';
const REDIS_KEY_ERROR_NAME_DISTRIBUTION_CACHE = BASE_REDIS_KEY + '_' + 'error_name_distribution_cache';

class DB {
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
  }

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
        redisDistributionList = await DB.getErrorNameDistributionInSameMonth(projectId, moment.unix(timeAt).startOf('day').unix(), moment.unix(timeAt).endOf('day').unix());
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

export default DB
