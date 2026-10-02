import fastifyJwt from "@fastify/jwt";
import fastifyPlugin from "fastify-plugin";
import getEnv from "../config/getEnv";

const jwtPlugin = fastifyPlugin(async (app) => {
  const { jwtSecret, jwtExpiresIn } = getEnv();

  await app.register(fastifyJwt, {
    secret: jwtSecret,
    sign: { expiresIn: jwtExpiresIn, algorithm: "HS256" },
    verify: { algorithms: ["HS256"] },
  });

  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Unauthorized",
      });
    }
  });
});

export default jwtPlugin;
