import { FastifyRequest, FastifyReply } from "fastify";
import * as authDb from "./services";

// --- Types ---
interface AuthBody {
  username: string;
  password: string;
}
interface RefreshBody {
  refreshToken: string;
}

// Signup handler
export async function signupHandler(
  req: FastifyRequest<{ Body: AuthBody }>,
  reply: FastifyReply
) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return reply.code(400).send({ error: "Username and password required" });
    }
    const existing = await authDb.findUserByUsername(username);
    if (existing) {
      return reply.code(409).send({ error: "User already exists" });
    }
    const hashedPassword = await req.server.bcrypt.hash(password);
    await authDb.createUser(username, hashedPassword);
    reply.send({ success: true, message: "User registered successfully" });
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}

// Login handler
export async function loginHandler(
  req: FastifyRequest<{ Body: AuthBody }>,
  reply: FastifyReply
) {
  try {
    const { username, password } = req.body;
    const user = await authDb.findUserByUsername(username);
    if (!user) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    const isMatch = await req.server.bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    const token = req.server.jwt.sign({ username, type: "access" });
    const refreshToken = req.server.jwt.sign(
      { username, type: "refresh" },
      { expiresIn: "7d" }
    );
    // Store refresh token in DB
    await authDb.insertRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    reply.send({ token, refreshToken });
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}

// Verify handler
export async function verifyHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
    const user = req.user as { username: string; type: string } | undefined;
    if (!user || user.type !== "access") {
      return reply.code(401).send({ valid: false, error: "Unauthorized" });
    }
    reply.send({ valid: true, user });
  } catch (err) {
    req.server.log.error(err);
    reply.code(401).send({ valid: false, error: "Unauthorized" });
  }
}

// Refresh handler
export async function refreshHandler(
  req: FastifyRequest<{ Body: RefreshBody }>,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      reply.code(400).send({ error: "Refresh token required" });
      return;
    }
    const tokenRow = await authDb.findRefreshToken(refreshToken);
    if (!tokenRow) {
      reply.code(401).send({ error: "Refresh token revoked or invalid" });
      return;
    }
    const payload = req.server.jwt.verify<{ username: string; type: string }>(
      refreshToken
    );
    if (payload.type !== "refresh") {
      reply.code(401).send({ error: "Not a refresh token" });
      return;
    }
    const token = req.server.jwt.sign({
      username: payload.username,
      type: "access",
    });
    reply.send({ token });
  } catch (err) {
    req.server.log.error(err);
    reply.code(401).send({ error: "Invalid refresh token" });
  }
}

// Logout handler
export async function logoutHandler(
  req: FastifyRequest<{ Body: RefreshBody }>,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = req.body;
    await authDb.deleteRefreshToken(refreshToken);
    reply.send({ success: true, message: "Logged out" });
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}
