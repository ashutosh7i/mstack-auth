import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";
import fastifyBcrypt from "fastify-bcrypt";
import fastifyEnv from "@fastify/env";
import "fastify";
import { authRouter } from "./routes";

// --- Type augmentations for Fastify ---
declare module "fastify" {
  interface FastifyInstance {
    config: {
      JWT_SECRET: string;
      JWT_EXPIRY: string;
      PORT: string;
    };
  }
}

// --- Type augmentations for JWT payload ---
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { username: string; type: string };
    user: { username: string; type: string };
  }
}

// --- Env schema ---
const schema = {
  type: "object",
  required: ["JWT_SECRET", "JWT_EXPIRY", "PORT"],
  properties: {
    JWT_SECRET: { type: "string" },
    JWT_EXPIRY: { type: "number" },
    PORT: { type: "number" },
  },
};

const options = {
  confKey: "config",
  schema: schema,
  dotenv: true,
  data: process.env,
};

const fastify = Fastify({
  logger: true,
});

// Start server
const start = async () => {
  try {
    await fastify.register(fastifyEnv, options);
    await fastify.register(cors, {
      origin: "*",
      methods: "*",
    });
    await fastify.register(fastifyJwt, {
      secret: fastify.config.JWT_SECRET,
      sign: { expiresIn: fastify.config.JWT_EXPIRY },
    });
    await fastify.register(fastifyBcrypt, {
      saltWorkFactor: 12,
    });
    await fastify.register(authRouter, { prefix: "/auth" });
    await fastify.ready();
    await fastify.listen({ port: Number(fastify.config.PORT) });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
