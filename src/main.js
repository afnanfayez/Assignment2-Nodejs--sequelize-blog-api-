import express from "express";
import config from "./config/config.service.js";
import { connect, sequelize } from "./database/connection.js";
import "./database/models/index.js";
import { userController } from "./modules/user/index.js";
import { postController } from "./modules/post/index.js";
import { commentController } from "./modules/comment/index.js";
import { globalErrorHandler } from "./common/globalErrorHandler.js";

const app = express();
app.use(express.json());
app.use("/users", userController);
app.use("/user", userController);
app.use("/posts", postController);
app.use("/comments", commentController);
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use(globalErrorHandler);
try {
  await connect();
  await sequelize.sync();
  const server = app.listen(config.port);
  server.on("listening", () => {
    console.log(`Server is running on http://localhost:${server.address().port}`);
  });
  server.on("error", async (error) => {
    console.error(error.message);
    await sequelize.close();
    process.exitCode = 1;
  });
} catch (error) {
  console.error("Startup failed:", error.message);
  await sequelize.close();
  process.exitCode = 1;
}
