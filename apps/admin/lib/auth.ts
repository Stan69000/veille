import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

const apiBaseUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return null;
        }

        const payload = await response.json();
        if (!payload?.success || !payload?.data?.user || !payload?.data?.token) {
          return null;
        }

        return {
          id: payload.data.user.id,
          email: payload.data.user.email,
          name: payload.data.user.name,
          workspaceId: payload.data.user.workspaceId,
          role: payload.data.user.role,
          accessToken: payload.data.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.workspaceId = (user as { workspaceId?: string }).workspaceId;
        token.role = (user as { role?: string }).role;
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.workspaceId = token.workspaceId as string;
        session.user.role = token.role as string;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
});

declare module 'next-auth' {
  interface User {
    workspaceId?: string;
    role?: string;
    accessToken?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      workspaceId: string;
      role: string;
    };
    accessToken?: string;
  }
}
