import fastifyPlugin from "fastify-plugin";
import prisma from "../lib/prisma";

const prismaPlugin = fastifyPlugin(async (app) => {
  app.decorate("prisma", prisma);
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});

export default prismaPlugin;
