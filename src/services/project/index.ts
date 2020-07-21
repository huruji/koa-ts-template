import { hash, parseAccountToUcid } from '../../util/index';

import Auth from '../../util/auth';
import { Context } from 'koa';
import apiRes from '../../util/api-res';
import { get } from 'lodash';
import projectUtil from '../../util/project'
import to from 'await-to-js';
import userUtil from '../../util/user';

const DEFAULT_AVATAR_URL = 'http://ww1.sinaimg.cn/large/00749HCsly1fwofq2t1kaj30qn0qnaai.jpg';

const { showError, showResult } = apiRes;

class Project {
  static list = async (ctx: Context) => {
    const { request: req } = ctx
    const ucid = ctx.cookies.get('ucid')
    const offset = 0;
    const max = 50;
    const { UserModel, ProjectModel } = ctx.Model

    // 判断是否是管理员，如果是，返回全部项目列表
    const [err, res] = await to(UserModel.findOne({
      where: {
        ucid,
      }
    }))

    const isAdmin = await userUtil.isAdmin(res)
    if (isAdmin) {
      const rawProjectList = await ProjectModel.findAll({
        where: {
          is_delete: 0
        }
      })
      const projectList = [];
      for (const rawProject of rawProjectList) {
        let project = projectUtil.formatRecord(rawProject.dataValues);
        project = {
          ...project,
          role: 'owner',
          need_alarm: 0
        };
        projectList.push(project);
      }
      return showResult(projectList)
    }

    // 去project_member里拿到ucid对应的项目成员
    // const rawProjectMemberList = await MProjetMember.getProjectMemberListByUcid(ucid, offset, max);
    // const projectIdList = [];
    // const projectMap = {}; // 以projectId为key
    // for (const rawProjectMember of rawProjectMemberList) {
    //   const id = rawProjectMember['project_id'];
    //   projectMap[id] = rawProjectMember;
    //   projectIdList.push(id);
    // }
    // // 去project拿到项目的名字
    // const rawProjectList = await MProject.getProjectListById(projectIdList);

    // const projectList = [];
    // for (const rawProject of rawProjectList) {
    //   let project = MProject.formatRecord(rawProject);
    //   const projectId = project['id'];
    //   project = {
    //     ...project,
    //     role: _.get(projectMap, [projectId, 'role'], MProjetMember.ROLE_DEV),
    //     need_alarm: _.get(projectMap, [projectId, 'need_alarm'], 0)
    //   };
    //   projectList.push(project);
    // }

    // res.send(API_RES.showResult(projectList));
  };
}

export default Project;
