import { STATUS_CODES } from "http";
import type { FastifyError } from "fastify";
import fastifyPlugin from "fastify-plugin";
import Joi from "joi";

interface JoiValidationError extends FastifyError {
  details?: Joi.ValidationErrorItem[];
}

const errorHandler = fastifyPlugin(async (app) => {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const isServerError = statusCode >= 500;

    if (error.code === "FST_ERR_VALIDATION") {
      const validationError = error as JoiValidationError;
      const details = validationError.details?.map(({ path, message }) => ({
        field: path.join("."),
        message,
      }));

      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Validation failed",
        details: details ?? [],
      });
    }

    if (error.code === "FST_ERR_CTP_INVALID_JSON_BODY") {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.message,
      });
    }

    if (isServerError) {
      request.log.error(error);
    }

    reply.status(statusCode).send({
      statusCode,
      error: STATUS_CODES[statusCode] ?? "Error",
      message: isServerError ? "Internal Server Error" : error.message,
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method}:${request.url} not found`,
    });
  });
});

export default errorHandler;
