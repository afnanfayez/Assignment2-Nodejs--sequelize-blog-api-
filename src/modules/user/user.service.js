import { User } from "../../database/models/index.js";
import { bodyObject, fail, pick, positiveId, text } from "../../common/globalErrorHandler.js";

const userFields = ["name", "email", "password", "role"];

export const signup = async (data) => {
  const body = bodyObject(data);
  const email = text(body.email, "email");
  if (await User.findOne({ where: { email } })) fail(409, "Email already exists.");
  const user = User.build(pick(body, userFields));
  await user.save();
  return user;
};

export const createOrUpdate = async (value, data) => {
  const id = positiveId(value);
  const fields = pick(bodyObject(data), userFields);
  if (!Object.keys(fields).length) fail(400, "Provide user fields to create or update.");
  for (const [field, value] of Object.entries(fields)) {
    if (typeof value !== "string") fail(400, `${field} must be a string.`);
  }
  const user = await User.findByPk(id);
  if (!user) {
    for (const field of ["name", "email", "password"]) {
      if (!fields[field]) fail(400, `${field} is required when creating a new user.`);
    }
  }
  if (fields.email !== undefined) {
    const emailOwner = await User.findOne({ where: { email: fields.email } });
    if (emailOwner && emailOwner.id !== id) fail(409, "Email already exists.");
  }
  if (user) {
    user.set(fields);
    await user.save({ validate: false });
    return user;
  }
  return User.create({ ...fields, id }, { validate: false });
};

export const getUserByEmail = async (value) => {
  const email = text(value, "email");
  const user = await User.findOne({ where: { email }, attributes: { exclude: ["password"] } });
  if (!user) fail(404, "no user found");
  return user;
};

export const getUserById = async (value) => {
  const user = await User.findByPk(positiveId(value), {
    attributes: { exclude: ["role", "password"] },
  });
  if (!user) fail(404, "no user found");
  return user;
};
