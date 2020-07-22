import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/db'

class ErrorSummary extends Model{
}

export default (tableName) => {
  ErrorSummary.init({
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
    url_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city_distribution_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    count_at_time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    count_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    error_count: {
      type: DataTypes.NUMBER,
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
  return ErrorSummary
}


// export default User
