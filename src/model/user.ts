import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/db'

class User extends Model<{cc: string}, { bb: string }> {
  id: string
  account: string
}

User.init({
  id: {
    type: DataTypes.STRING,
    autoIncrement: true,
    primaryKey: true
  },
  ucid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password_md5: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  register_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_delete: {
    type: DataTypes.NUMBER,
    allowNull: false,
    defaultValue: 0
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
  modelName: 't_o_user',
  timestamps: false
})


export default User
