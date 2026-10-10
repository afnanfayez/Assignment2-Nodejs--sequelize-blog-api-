import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";

export const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};

export const positiveId = (value, field = "id") => {
  const id = typeof value === "number" ? value : typeof value === "string" && /^\d+$/.test(value) ? Number(value) : NaN;
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    fail(400, `${field} must be a positive integer.`);
  }
  return id;
};

export const bodyObject = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    fail(400, "A JSON object is required.");
  }
  return body;
};

export const text = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    fail(400, `${field} must be a non-empty string.`);
  }
  return value;
};

export const pick = (body, fields) => Object.fromEntries(
  fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]]),
);

export const globalErrorHandler = (error, req, res, next) => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: "Email already exists." });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: "Validation error.",
      errors: error.errors.map(({ path, message }) => ({ field: path, message })),
    });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ message: "The referenced user or post does not exist." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body." });
  }
  if ([1048, 1264, 1265, 1292, 1364, 1406].includes(error.original?.errno)) {
    return res.status(400).json({ message: "Invalid or missing field value." });
  }
  const status = error.status || (Number.isInteger(error.cause) ? error.cause : 500);
  if (status >= 500) console.error(error);
  return res.status(status).json({
    message: status >= 500 ? "Internal server error." : error.message,
  });
};
