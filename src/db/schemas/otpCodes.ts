import { 
  mysqlTable, 
  varchar, 
  timestamp, 
  index } from "drizzle-orm/mysql-core";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const otpCodes = mysqlTable(
  "otp_codes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    contact: varchar("contact", { length: 128 }).notNull(),
    code: varchar("code", { length: 10 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(), // "generated", "sent", "verified", "user_created", "failed"
    expiresAt: timestamp("expires_at").notNull(),
    ...timestamps,
  },
  (table) => ({
    Idx: index("otp_codes_id_idx").on(table.id),
    contactIdx: index("otp_codes_contact_idx").on(table.contact),
    codeIdx: index("otp_codes_code_idx").on(table.code),
  })
);
