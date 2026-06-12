import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Redis from "ioredis";
import { getCustomer } from "./store";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 2
});

async function saveRefreshToken(userId: string, refreshToken: string) {
  try {
    await redis.connect();
    await redis.set(`auth:refresh:${userId}`, refreshToken, "EX", 60 * 60 * 24 * 30);
    await redis.set(`auth:session:${userId}`, JSON.stringify({ userId, rotatedAt: Date.now() }), "EX", 60 * 60);
  } catch {
    return refreshToken;
  }
  return refreshToken;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        phone: { label: "Phone", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const customer = getCustomer(credentials.email);
        if (!customer) return null;
        return { id: customer.id, email: customer.email, name: customer.name };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.refreshToken = await saveRefreshToken(user.id, crypto.randomUUID());
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
      }
      return session;
    }
  }
};
