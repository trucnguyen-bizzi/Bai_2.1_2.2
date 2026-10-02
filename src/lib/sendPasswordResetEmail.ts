import type { FastifyBaseLogger } from "fastify";
import getEnv from "../config/getEnv";

function sendPasswordResetEmail(logger: FastifyBaseLogger, email: string, token: string): void {
  if (getEnv().nodeEnv !== "production") {
    logger.info({ email, token }, "Password reset token");
  }
}

export default sendPasswordResetEmail;
