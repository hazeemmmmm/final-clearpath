import Joi from "joi";
import * as AppError from "../utils/error/index.js";

export const isValid = (schema) => {
  return (req, res, next) => {
    try {
      // 1. If the schema itself is a Joi object with a validate method
      if (schema && typeof schema.validate === 'function') {
        const data = { ...req.body, ...req.params, ...req.query };
        const { error, value } = schema.validate(data, {
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: true,
        });

        if (error) {
          const errors = error.details.map(issue => ({
            path: issue.path.join("."),
            message: issue.message,
          }));
          return next(new AppError.BadRequestException(JSON.stringify(errors)));
        }
        return next();
      }

      // 2. If the schema is an object containing nested Joi schemas for body, params, or query
      if (schema && typeof schema === 'object') {
        const keys = ['body', 'params', 'query'];
        for (const key of keys) {
          if (schema[key] && typeof schema[key].validate === 'function') {
            const { error, value } = schema[key].validate(req[key], {
              abortEarly: false,
              allowUnknown: true,
              stripUnknown: true,
            });

            if (error) {
              const errors = error.details.map(issue => ({
                path: issue.path.join("."),
                message: issue.message,
              }));
              return next(new AppError.BadRequestException(JSON.stringify(errors)));
            }
            
            // Assign the cleaned/validated data back to the request
            req[key] = value;
          }
        }
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};