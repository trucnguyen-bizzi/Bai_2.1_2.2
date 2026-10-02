import { STATUS_CODES } from "http";
import type { FastifyError } from "fastify";
import fastifyPlugin from "fastify-plugin";

const errorHandler = fastifyPlugin(async (app) => {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const isServerError = statusCode >= 500;

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
