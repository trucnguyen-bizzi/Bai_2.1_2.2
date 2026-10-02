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
});

export default jwtPlugin;
