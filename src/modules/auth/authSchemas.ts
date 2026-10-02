import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().max(254).lowercase().trim().required(),
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .trim()
    .required(),
  password: Joi.string().min(8).max(64).required(),
}).unknown(false);
