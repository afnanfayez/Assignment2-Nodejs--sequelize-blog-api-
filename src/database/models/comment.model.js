import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export class Comment extends Model {}

Comment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: "comment",
    timestamps: true,
  },
);
