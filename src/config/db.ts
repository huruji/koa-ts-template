import { Sequelize } from 'sequelize'
import { mysqlConfig } from '.'
const { database, password, port, host, user } = mysqlConfig


const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  define: {
    freezeTableName: true
  }
})

export default sequelize
