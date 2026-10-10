import { config } from "dotenv";
import { fileURLToPath } from "node:url";

const environment = process.env.NODE_ENV || "development";
config({ path: fileURLToPath(new URL(`../../${environment}.env`, import.meta.url)), quiet: true });

export default {
  port: Number(process.env.PORT || 3000),
  db: {
    name: process.env.DB_NAME || "assignment5",
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    pass: process.env.DB_PASS || "",
    dialect: process.env.DB_DIALECT || "mysql",
    max: Number(process.env.DB_MAX || 10),
    min: Number(process.env.DB_MIN || 1),
  },
};
