import {
  mysqlTable,
  timestamp,
  varchar
} from "drizzle-orm/mysql-core";

// Common timestamps for all tables
const timestamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// Refresh tokens table schema
export const refreshTokens = mysqlTable("refresh_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 200 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
});