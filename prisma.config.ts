import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 ya no carga el .env automáticamente: lo hace `dotenv/config`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` no necesita conexión; las migraciones sí.
    url: process.env.DATABASE_URL ?? "",
  },
});
