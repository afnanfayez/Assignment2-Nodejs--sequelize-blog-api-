import { Sequelize } from "sequelize";
import config from "../config/config.service.js";

export const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: false,
    pool: { max: config.db.max, min: config.db.min },
  },
);

export const connect = async () => {
  await sequelize.authenticate();
  console.log("DB connected");
};
