import { FastifyInstance } from "fastify";
import {
  signupHandler,
  loginHandler,
  verifyHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
  sendOtp,
  verifyOtp
} from "./controllers";

export async function authRouter(fastify: FastifyInstance) {
  fastify.post("/signup", signupHandler);
  fastify.post("/login", loginHandler);
  fastify.get("/verify", verifyHandler);
  fastify.post("/refresh", refreshHandler);
  fastify.post("/logout", logoutHandler);
  fastify.post("/logoutall", logoutAllHandler)
  fastify.post("/otp-send", sendOtp),
  fastify.post("/otp-verify",verifyOtp)
}
