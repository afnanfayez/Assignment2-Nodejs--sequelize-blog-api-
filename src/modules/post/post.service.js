import { col, fn } from "sequelize";
import { User, Post, Comment } from "../../database/models/index.js";
import { bodyObject, fail, positiveId, text } from "../../common/globalErrorHandler.js";

export const createPost = async (data) => {
  const body = bodyObject(data);
  const userId = positiveId(body.userId, "userId");
  if (!await User.findByPk(userId)) fail(404, "User not found.");
  const post = new Post({ title: text(body.title, "title"), content: text(body.content, "content"), userId });
  await post.save();
  return post;
};

export const deletePost = async (value, data) => {
  const postId = positiveId(value, "postId");
  const userId = positiveId(bodyObject(data).userId, "userId");
  const post = await Post.findByPk(postId);
  if (!post) fail(404, "Post not found.");
  if (post.userId !== userId) fail(403, "You are not authorized to delete this post.");
  await post.destroy();
};

export const getPostsDetails = () => Post.findAll({
  attributes: ["id", "title"],
  include: [
    { model: User, attributes: ["id", "name"] },
    { model: Comment, attributes: ["id", "content"] },
  ],
  order: [["id", "ASC"], [Comment, "id", "ASC"]],
});

export const getPostsCommentCount = async () => {
  const posts = await Post.findAll({
    attributes: ["id", "title", [fn("COUNT", col("comments.id")), "commentCount"]],
    include: [{ model: Comment, attributes: [] }],
    group: ["post.id", "post.title"],
    order: [["id", "ASC"]],
  });
  return posts.map((post) => {
    const data = post.get({ plain: true });
    return { ...data, commentCount: Number(data.commentCount) };
  });
};
