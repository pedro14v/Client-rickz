import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import authConfig from "./auth.config"
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
 
export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token }) {
      console.log(token)
      const userConfig = await prisma.user.findUnique({
        where: {
          email: token?.email as string
        },
        include: {
          Creditos: {
            select: {
              creditos: true
            }
          },
          SessionWhatsapp: true,
          Combos: {
            orderBy: {
              createdAt: 'desc'
            },
          }
        }
      }).catch((err : any) => { return null }).then((res : any) => { return res }) as any

   
      if(userConfig?.Creditos.length === 0) {
        const creditos = await prisma.creditos.create({
          data: {
            userId: userConfig.id,
            creditos: 1000
          }
        }).then((res) => { return res }).catch((err) => { return null }) as any

        userConfig.Creditos = creditos
      }

      if(userConfig) {
        token.user = {
          ...userConfig
        }
      }

      return token
    },
    async session({ session, token, newSession }) {
      var user = token?.user as any
      console.log(user)
      const member = await prisma.member.findFirst({
        where: {
          userEmail: user.email 
        }
      }).catch((err) => { return null }).then((res) => { return res }) as any
      console.log(user)
      console.log(member)

      var Assistente
      if(member?.permissions?.assistentes === 'ALL'){
        Assistente = await prisma.assistente.findMany({
          where: {
            userToken: user.token
          }
        }).catch((err) => { return null }).then((res) => { return res }) as any
        console.log(Assistente)
      }

      if(member?.permissions?.assistentes !== 'ALL'){
        Assistente = await prisma.assistente.findFirst({
          where: {
            id: member.assistenteId
          }
        }).catch((err) => { return null }).then((res) => { return res }) as any
        console.log(Assistente)
        Assistente = [Assistente]
      }
      
      console.log(member)

      console.log(Assistente)
      console.log(Assistente?.length)

      var nerSession = {
        ...session,
        user: {
          Assistente : Assistente,
          Member: member,
          ...user
        }
      }

      prisma.$disconnect()
      return nerSession
    },
    async signIn({ user, account, profile, email, credentials } : any) {
      console.log(user, account, profile, email, credentials)
      if(!credentials && user?.error && !account?.access_token) {
        throw new Error(user?.error)
      }
      return user;
    },
    redirect({ url }) {
      console.log('----URL----', url)
      return url
    },
  },
  pages: {
    signIn: "/auth",
    signOut: "/auth/logout",
  },
  cookies: {
    pkceCodeVerifier: {
      name: "pkce_code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
    },
  }, 
  trustHost : true,
  ...authConfig,
})