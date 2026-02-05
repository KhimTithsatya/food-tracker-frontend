import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

function isReal(value) {
  return value && !String(value).startsWith("YOUR_");
}

const providers = [];

// Social providers only if configured
if (isReal(process.env.GOOGLE_CLIENT_ID) && isReal(process.env.GOOGLE_CLIENT_SECRET)) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (isReal(process.env.GITHUB_CLIENT_ID) && isReal(process.env.GITHUB_CLIENT_SECRET)) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

// Credentials provider (email/password -> your backend)
providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const res = await fetch(`${process.env.BACKEND_URL || "http://localhost:5001"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials?.email,
          password: credentials?.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) return null;

      return {
        ...data.user,
        backendToken: data.token,
      };
    },
  })
);

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
