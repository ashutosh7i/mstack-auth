import { db } from "src/db";
import { and, eq, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { users } from "src/db/schemas/users";
import { refreshTokens } from "./db/schemas/refreshTokens";
import { otpCodes } from "./db/schemas/otpCodes";

export async function createUser(username: string, password: string) {
  const id = randomUUID();
  await db.insert(users).values({ id, username, password });
  return id;
}

export async function findUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));
  return user;
}

export async function insertRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date
) {
  const id = randomUUID();
  await db.insert(refreshTokens).values({ id, userId, token, expiresAt });
}

export async function findRefreshToken(token: string) {
  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return row;
}
export async function deleteUserRefreshToken(token: string): Promise<boolean> {
  const [result] = await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return result.affectedRows > 0;
}

export async function deleteUserAllRefreshTokens(
  userId: string
): Promise<number> {
  const [result] = await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.userId, userId));
  return result.affectedRows;
}

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtpEntryAndMarkSent(phoneNo: string) {
  const code = generateOtpCode();
  const id = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  await db.insert(otpCodes).values({
    id,
    contact: phoneNo,
    code,
    status: "sent",
    expiresAt,
    createdAt: now,
    updatedAt: now,
  });
  return { code, id };
}

export async function verifyOtpCode(phoneNo: string, code: string) {
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.contact, phoneNo),
        eq(otpCodes.code, code),
        or(
          eq(otpCodes.status, "sent"),
          eq(otpCodes.status, "generated")
        )
      )
    );

  if (!otp || otp.expiresAt < new Date()) {
    return false;
  }
  return true;
}

export async function markOtpVerifiedIfNeeded(phoneNo: string, code: string) {
  await db
    .update(otpCodes)
    .set({ status: "verified" })
    .where(
      and(
        eq(otpCodes.contact, phoneNo),
        eq(otpCodes.code, code),
        or(
          eq(otpCodes.status, "sent"),
          eq(otpCodes.status, "generated")
        )
      )
    );
}

export async function markOtpUserCreated(phoneNo: string, code: string) {
  await db
    .update(otpCodes)
    .set({ status: "user_created" })
    .where(
      and(
        eq(otpCodes.contact, phoneNo),
        eq(otpCodes.code, code),
        eq(otpCodes.status, "verified")
      )
    );
}
