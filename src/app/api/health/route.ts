import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { getMailDriver } from "@/libs/mail";
import { isPushEnabled } from "@/libs/push";
import { getStorageDriver } from "@/libs/storage";
import { isGoogleEnabled } from "@/libs/auth";

// GET /api/health: estado de la base de datos y de los servicios opcionales
export async function GET() {
  let database: "ok" | "error" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  return NextResponse.json(
    {
      status: database === "ok" ? "ok" : "degraded",
      database,
      services: {
        google: isGoogleEnabled(),
        mail: getMailDriver(),
        storage: getStorageDriver(),
        push: isPushEnabled(),
      },
    },
    { status: database === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
