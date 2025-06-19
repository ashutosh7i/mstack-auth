import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import * as authDb from "./services";
import * as argon2 from "argon2";

// --- Types ---
interface AuthBody {
  username: string;
  password: string;
}
interface RefreshBody {
  refreshToken: string;
}
interface LogoutAllBody {
  userId: string;
}
interface PhoneNoBody {
  phoneNo: string;
}
interface OtpLoginBody extends PhoneNoBody {}
interface OtpVerifyBody extends PhoneNoBody {
  otp: string;
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
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 12,
      timeCost: 2,
      parallelism: 1,
    });
    await authDb.createUser(username, hashedPassword);
    reply.send({ success: true, message: "User registered successfully" });
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}

export async function issueTokens(
  user: { id: string; username: string },
  jwt: FastifyInstance["jwt"],
  insertRefreshToken: typeof authDb.insertRefreshToken
) {
  const token = jwt.sign({ username: user.username, type: "access" });
  const refreshToken = jwt.sign(
    { username: user.username, type: "refresh" },
    { expiresIn: "7d" }
  );
  await insertRefreshToken(
    user.id,
    refreshToken,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  return { token, refreshToken };
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
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    const tokens = await issueTokens(
      user,
      req.server.jwt,
      authDb.insertRefreshToken
    );
    reply.send(tokens);
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
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return reply.code(400).send({ error: "Refresh token required" });
    }
    const deleted = await authDb.deleteUserRefreshToken(refreshToken);
    if (!deleted) {
      return reply
        .code(400)
        .send({ error: "Refresh token not found or already revoked" });
    }
    reply.send({ success: true, message: "Logged out" });
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}

export async function logoutAllHandler(
  req: FastifyRequest<{ Body: LogoutAllBody }>,
  reply: FastifyReply
) {
  try {
    const { userId } = req.body || {};
    if (!userId) {
      return reply.code(400).send({ error: "User ID required" });
    }
    const deleted = await authDb.deleteUserAllRefreshTokens(userId);
    if (!deleted) {
      return reply
        .code(400)
        .send({ error: "No active sessions found for user" });
    }
    reply.send({
      success: true,
      tokensDeleted: deleted,
      message: "Logged out from all sessions",
    });
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}

export async function sendOtp(
  req: FastifyRequest<{ Body: OtpLoginBody }>,
  reply: FastifyReply
) {
  try {
    const { phoneNo } = req.body;
    if (!phoneNo) {
      return reply.code(400).send({ error: "Phone number required" });
    }
    const { code, id } = await authDb.createOtpEntryAndMarkSent(phoneNo);

    // Send OTP via SMS (async, don't block response)
    // sendOtpSms(phoneNo, code).catch(err => req.server.log.error("SMS send failed", err));
    console.log(`Generated OTP: ${code} for ID: ${id}`);
    reply.send({ success: true, message: "OTP sent successfully", otp: code});
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}

export async function verifyOtp(
  req: FastifyRequest<{ Body: OtpVerifyBody }>,
  reply: FastifyReply
) {
  try {
    const { phoneNo, otp } = req.body;
    if (!phoneNo || !otp) {
      return reply.code(400).send({ error: "Phone number and OTP required" });
    }
    const now = new Date();
    const verify = await authDb.verifyOtpCode(phoneNo, otp);
    if (!verify) {
      return reply.code(400).send({ error: "Invalid or expired OTP" });
    }
    let user = await authDb.findUserByUsername(phoneNo);
    let isNewUser = false;

    if (!user) {
      const userId = await authDb.createUser(phoneNo, "");
      await Promise.all([authDb.markOtpUserCreated(phoneNo, otp)]);
      user = {
        id: userId,
        username: phoneNo,
        password: "",
        createdAt: now,
        updatedAt: now,
      };
      isNewUser = true;
    } else {
      await authDb.deleteUserAllRefreshTokens(user.id);
    }
    const tokens = await issueTokens(
      user,
      req.server.jwt,
      authDb.insertRefreshToken
    );
    return reply.send({
      success: true,
      newUser: isNewUser,
      message: isNewUser
        ? "OTP verified and user created successfully"
        : "OTP verified successfully, previous sessions revoked",
      ...tokens,
    });
  } catch (err) {
    req.server.log.error(err);
    reply.code(500).send({ error: "Something went wrong" });
  }
}