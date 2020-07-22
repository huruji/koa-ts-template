import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/db'

class Monitor extends Model{
}

export default (tableName) => {
  Monitor.init({
    id: {
      type: DataTypes.STRING,
      autoIncrement: true,
      primaryKey: true
    },
    error_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    error_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    http_code: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    monitor_ext_id: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    during_ms: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    request_size_b: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    response_size_b: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    log_at: {
      type: DataTypes.NUMBER,
      allowNull:false
    },
    md5: {
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
    modelName: tableName,
    timestamps: false
  })
  return Monitor
}


// export default User
