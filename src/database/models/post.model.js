import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export class Post extends Model {}

Post.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    content: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: "post",
    timestamps: true,
    paranoid: true,
  },
);
