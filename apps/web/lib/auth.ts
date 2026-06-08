import { serverLogin } from "@/providers/server-login"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { Role } from "@/types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const data = await serverLogin(
          credentials.email as string,
          credentials.password as string
        )
        if (!data) return null
        return { ...data.user, accessToken: data.accessToken }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accessToken = user.accessToken
        token.avatar = user.avatar ?? null
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      session.user.accessToken = token.accessToken as string
      session.user.avatar = token.avatar as string | null
      if (token.name) session.user.name = token.name
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
})
