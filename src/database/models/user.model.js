import { DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

const checkNameLength = (user) => {
  if (typeof user.name !== "string" || user.name.trim().length <= 2) {
    throw new Error("Name must be greater than 2 characters", { cause: 400 });
  }
};

export const User = sequelize.define(
  "user",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkPasswordLength(value) {
          if (typeof value !== "string" || value.length <= 6) {
            throw new Error("Password must be greater than 6 characters", {
              cause: 400,
            });
          }
        },
      },
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
      validate: { isIn: [["user", "admin"]] },
    },
  },
  {
    timestamps: true,
    hooks: { beforeCreate: checkNameLength },
  },
);
