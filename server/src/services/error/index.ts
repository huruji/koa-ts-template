import * as _ from 'lodash';
import * as moment from 'moment';

import { Op, col, fn } from 'sequelize';
import { getDatabaseTimeList, getQueryParam, getRedisKey, getTableName, paddingTimeList } from './util';

import { Context } from 'koa';
import DATE_FORMAT from '../../util/date_format';
import DB from './db'
import apiRes from '../../util/api-res';

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

    const errorList = await DB.getErrorNameDistributionByTimeWithCache(projectId, startAt, endAt);
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

    const rawDistributionList = await DB.getUrlPathDistributionListByErrorNameList(projectId, startAt, endAt, errorNameList, countType, 10);
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

    const rawRecordList = await DB.getStackAreaDistribution(projectId, startAt, endAt, countType, errorNameList, url);

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

    const rawDistributionList = await DB.getErrorNameDistributionListInSameMonth(projectId, startAt, endAt, countType, errorNameList, url);
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

    const errorCount = await DB.getTotalCountByConditionInSameMonth(projectId, startAt, endAt, offset, 10, errorNameList, url);
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

}

export default Error;
