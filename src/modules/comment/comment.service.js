import { Op } from "sequelize";
import { sequelize } from "../../database/connection.js";
import { User, Post, Comment } from "../../database/models/index.js";
import { bodyObject, fail, positiveId, text } from "../../common/globalErrorHandler.js";

const commentValues = (value) => {
  const body = bodyObject(value);
  return {
    content: text(body.content, "content"),
    userId: positiveId(body.userId, "userId"),
    postId: positiveId(body.postId, "postId"),
  };
};

const checkReferences = async (values, transaction) => {
  const userIds = [...new Set(values.map((value) => value.userId))];
  const postIds = [...new Set(values.map((value) => value.postId))];
  const users = await User.count({ where: { id: userIds }, transaction });
  const posts = await Post.count({ where: { id: postIds }, transaction });
  if (users !== userIds.length) fail(404, "User not found.");
  if (posts !== postIds.length) fail(404, "Post not found.");
};

export const createBulk = async (data) => {
  const { comments } = bodyObject(data);
  if (!Array.isArray(comments) || !comments.length) fail(400, "comments must be a non-empty array.");
  const values = comments.map(commentValues);
  return sequelize.transaction(async (transaction) => {
    await checkReferences(values, transaction);
    return Comment.bulkCreate(values, { validate: true, transaction });
  });
};

export const updateComment = async (value, data) => {
  const id = positiveId(value, "commentId");
  const body = bodyObject(data);
  const userId = positiveId(body.userId, "userId");
  const content = text(body.content, "content");
  const comment = await Comment.findByPk(id);
  if (!comment) fail(404, "Comment not found.");
  if (comment.userId !== userId) fail(403, "You are not authorized to update this comment.");
  await comment.update({ content });
};

export const findOrCreate = async (data) => {
  const values = commentValues(data);
  await checkReferences([values]);
  const [comment, created] = await Comment.findOrCreate({ where: values });
  return { comment, created };
};

export const searchComments = (value) => {
  const word = text(value, "word").replace(/[\\%_]/g, "\\$&");
  return Comment.findAndCountAll({
    where: { content: { [Op.like]: `%${word}%` } },
    order: [["id", "ASC"]],
  });
};

export const newestComments = async (value) => {
  const postId = positiveId(value, "postId");
  if (!await Post.findByPk(postId)) fail(404, "Post not found.");
  return Comment.findAll({
    where: { postId },
    attributes: ["id", "content", "createdAt"],
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    limit: 3,
  });
};

export const commentDetails = async (value) => {
  const comment = await Comment.findByPk(positiveId(value), {
    attributes: ["id", "content"],
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Post, attributes: ["id", "title", "content"] },
    ],
  });
  if (!comment) fail(404, "no comment found");
  return comment;
};
