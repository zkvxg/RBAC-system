const { BadRequestError } = require("../errors");

const toDetails = (issues, location) =>
  issues.map((issue) => ({
    path: [location, ...issue.path].join("."),
    message: issue.message,
  }));

const validate = (schemas) => (req, res, next) => {
  const details = [];

  for (const location of ["params", "query", "body"]) {
    const schema = schemas[location];
    if (!schema) continue;

    const result = schema.safeParse(req[location] ?? {});
    if (result.success) {
      req[location] = result.data;
    } else {
      details.push(...toDetails(result.error.issues, location));
    }
  }

  if (details.length > 0) {
    return next(new BadRequestError(details[0].message, details));
  }
  next();
};

module.exports = { validate };
