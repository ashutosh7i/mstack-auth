import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";
import fastifyBcrypt from "fastify-bcrypt";
import fastifyEnv from "@fastify/env";

const schema = {
    type: "object",
    required: ["JWT_SECRET", "JWT_EXPIRY", "PORT"],
    properties: {
        JWT_SECRET: {
            type: "string",
        },
        JWT_EXPIRY: {
            type: "string",
        },
        PORT: {
            type: "string",
        },
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

// In-memory user store
const users = [];
// In-memory refresh token store
const refreshTokens = [];

// Signup endpoint
fastify.post("/signup", async (req, reply) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return reply.code(400).send({ error: "Username and password required" });
        }
        if (users.find((u) => u.username === username)) {
            return reply.code(409).send({ error: "User already exists" });
        }
        const hashedPassword = await fastify.bcrypt.hash(password);
        users.push({ username, password: hashedPassword });
        reply.send({ success: true, message: "User registered successfully" });
    } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ error: "Something went wrong" });
    }
});

// Login endpoint
fastify.post("/login", async (req, reply) => {
    try {
        const { username, password } = req.body;
        const user = users.find((u) => u.username === username);
        if (!user) {
            return reply.code(401).send({ error: "Invalid credentials" });
        }
        const isMatch = await fastify.bcrypt.compare(password, user.password);
        if (!isMatch) {
            return reply.code(401).send({ error: "Invalid credentials" });
        }
        const token = fastify.jwt.sign({ username, type: "access" });
        const refreshToken = fastify.jwt.sign(
            { username, type: "refresh" },
            { expiresIn: "7d" }
        );
        refreshTokens.push(refreshToken); // Store the refresh token
        reply.send({ token, refreshToken });
    } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ error: "Something went wrong" });
    }
});

// JWT verification endpoint
fastify.get("/verify", async (req, reply) => {
    try {
        await req.jwtVerify();
        if (req.user.type !== "access") {
            return reply.code(401).send({ valid: false, error: "Unauthorized" });
        }
        reply.send({ valid: true, user: req.user });
    } catch (err) {
        fastify.log.error(err);
        reply.code(401).send({ valid: false, error: "Unauthorized" });
    }
});

// Refresh token endpoint
fastify.post("/refresh", async (req, reply) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return reply.code(400).send({ error: "Refresh token required" });
        }
        if (!refreshTokens.includes(refreshToken)) {
            return reply
                .code(401)
                .send({ error: "Refresh token revoked or invalid" });
        }
        const payload = fastify.jwt.verify(refreshToken);
        if (payload.type !== "refresh") {
            return reply.code(401).send({ error: "Not a refresh token" });
        }
        const token = fastify.jwt.sign({
            username: payload.username,
            type: "access",
        });
        reply.send({ token });
    } catch (err) {
        fastify.log.error(err);
        reply.code(401).send({ error: "Invalid refresh token" });
    }
});

// Logout endpoint to revoke refresh token
fastify.post("/logout", async (req, reply) => {
    try {
        const { refreshToken } = req.body;
        const idx = refreshTokens.indexOf(refreshToken);
        if (idx > -1) {
            refreshTokens.splice(idx, 1);
        }
        reply.send({ success: true, message: "Logged out" });
    } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ error: "Something went wrong" });
    }
});

const start = async () => {
    try {
        await fastify.register(fastifyEnv, options);
        await fastify.register(cors, {
            origin: "*",
            methods: "*",
        });
        await fastify.register(fastifyJwt, {
            secret: process.env.JWT_SECRET,
            sign: { expiresIn: process.env.JWT_EXPIRY },
        });
        await fastify.register(fastifyBcrypt, {
            saltWorkFactor: 12,
        });
        await fastify.ready();
        await fastify.listen({ port: process.env.PORT });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
