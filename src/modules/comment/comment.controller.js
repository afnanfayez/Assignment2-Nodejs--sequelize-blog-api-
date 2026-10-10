import { Router } from "express";
import * as comments from "./comment.service.js";

export const commentController = Router();

commentController.post("/", async (req, res) => {
  const created = await comments.createBulk(req.body);
  res.status(201).json({ message: "comments created.", comments: created });
});

commentController.post("/find-or-create", async (req, res) => {
  const { comment, created } = await comments.findOrCreate(req.body);
  res.status(created ? 201 : 200).json({ comment, created });
});

commentController.get("/search", async (req, res) => {
  const { count, rows } = await comments.searchComments(req.query.word);
  res.json({ ...(count ? {} : { message: "no comments found." }), count, comments: rows });
});

commentController.get("/newest/:postId", async (req, res) => {
  res.json(await comments.newestComments(req.params.postId));
});

commentController.get("/details/:id", async (req, res) => {
  res.json(await comments.commentDetails(req.params.id));
});

commentController.patch("/:commentId", async (req, res) => {
  await comments.updateComment(req.params.commentId, req.body);
  res.json({ message: "Comment updated." });
});
