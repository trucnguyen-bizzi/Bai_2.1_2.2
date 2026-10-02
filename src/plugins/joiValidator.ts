import Joi from "joi";
import fastifyPlugin from "fastify-plugin";

const joiValidator = fastifyPlugin(async (app) => {
  app.setValidatorCompiler(({ schema }) => (data) => {
    const { error, value } = (schema as Joi.Schema).validate(data, { abortEarly: false });

    if (error) {
      return { error };
    }

    return { value };
  });
});

export default joiValidator;
