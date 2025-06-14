import { db } from "src/db";
import { users } from "src/db/schemas/users";
import { refreshTokens } from "./db/schemas/refreshTokens";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

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

export async function deleteRefreshToken(token: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}
