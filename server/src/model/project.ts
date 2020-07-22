import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/db'

class Project extends Model {
}

Project.init({
  id:  {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  display_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  c_desc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rate: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  is_delete: {
    type: DataTypes.NUMBER,
    allowNull: false,
    defaultValue: 0
  },
  create_ucid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  update_ucid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: +(new Date())
  },
  update_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: +(new Date())
  }
}, {
  sequelize,
  tableName: 't_o_project',
  timestamps: false
})

export default Project
