import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schemas",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
