import {
  mysqlTable,
  timestamp,
  varchar,
  text,
  index,
} from "drizzle-orm/mysql-core";

// Common timestamps for all tables
const timestamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// Refresh tokens table schema
export const refreshTokens = mysqlTable(
  "refresh_tokens",
  {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    userId: varchar("user_id", { length: 36 }).notNull(),
    token: varchar("token", { length: 512 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ...timestamps,
  },
  // Indexes
  (table) => ({
    userIdIdx: index("refresh_tokens_user_id_idx").on(table.userId),
    tokenIdx: index("refresh_tokens_token_idx").on(table.token),
  })
);
