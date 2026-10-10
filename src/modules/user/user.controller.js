import { Router } from "express";
import * as users from "./user.service.js";

export const userController = Router();

userController.post("/signup", async (req, res) => {
  const user = await users.signup(req.body);
  const { password, ...data } = user.get({ plain: true });
  res.status(201).json({ message: "User added successfully.", user: data });
});

userController.get("/by-email", async (req, res) => {
  const user = await users.getUserByEmail(req.query.email);
  res.json({ user });
});

userController.put("/:id", async (req, res) => {
  await users.createOrUpdate(req.params.id, req.body);
  res.json({ message: "User created or updated successfully" });
});

userController.get("/:id", async (req, res) => {
  res.json(await users.getUserById(req.params.id));
});
