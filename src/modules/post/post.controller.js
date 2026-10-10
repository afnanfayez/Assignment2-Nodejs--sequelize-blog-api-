import { Router } from "express";
import * as posts from "./post.service.js";

export const postController = Router();

postController.post("/", async (req, res) => {
  const post = await posts.createPost(req.body);
  res.status(201).json({ message: "Post created successfully.", post });
});

postController.get("/details", async (req, res) => {
  res.json(await posts.getPostsDetails());
});

postController.get("/comment-count", async (req, res) => {
  res.json(await posts.getPostsCommentCount());
});

postController.delete("/:postId", async (req, res) => {
  await posts.deletePost(req.params.postId, req.body);
  res.json({ message: "Post deleted." });
});
