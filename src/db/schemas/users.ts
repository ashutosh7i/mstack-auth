import {
  mysqlTable,
  timestamp,
  varchar,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// Common timestamps for all tables
const timestamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// Users table schema
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    username: varchar("username", { length: 64 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    ...timestamps,
  },
  // Indexes
  (table) => ({
    idIdx: index("users_id_idx").on(table.id),
    usernameIdx: uniqueIndex("users_username_unique").on(table.username),
  })
);
