import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/libs/prisma";
import { verifyPassword } from "@/libs/password";
import { rateLimit } from "@/libs/rate-limit";
import { signInSchema } from "@/libs/validations/auth";

// Hash de un valor aleatorio: igualar el tiempo de respuesta cuando el
// correo no existe evita enumerar usuarios midiendo la latencia.
const DUMMY_HASH = "$2b$12$Y3oreOJ5ta8iL9N/us0i2eivw6ZRulJ7S.SxgEKRP9XdEPE/lQtbm";

/** Google se activa solo si ambas credenciales están definidas. */
export function isGoogleEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function buildProviders(): NextAuthOptions["providers"] {
  const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
      id: "credentials",
      name: "Email y contraseña",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const limit = rateLimit(`signin:${email}`, { limit: 10, windowMs: 15 * 60 * 1000 });
        if (!limit.success) throw new Error("TooManyAttempts");

        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await verifyPassword(password, user?.password ?? DUMMY_HASH);
        if (!user?.password || !valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ];

  if (isGoogleEnabled()) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      const emailVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified;
      if (!email || emailVerified === false) return false;

      // Sin adapter: la cuenta de Google se vincula por correo verificado.
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            emailVerified: existing.emailVerified ?? new Date(),
            image: existing.image ?? user.image,
            name: existing.name ?? user.name,
          },
        });
      } else {
        await prisma.user.create({
          data: { email, name: user.name, image: user.image, emailVerified: new Date() },
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Solo en el inicio de sesión: guarda el id y el rol de la base de datos
      if (account && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
};
