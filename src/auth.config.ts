import { type NextAuthConfig } from "next-auth";    
import { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs';
import { ZodError } from "zod"
import z from "zod";

import Google from "next-auth/providers/google";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const signInSchema = z.object({
  email: z
    .string({ required_error: "É necessário informar um email." })
    .email({ message: "Email inválido." }),
  password: z.string({ required_error: "É necessário informar uma senha." }),
});


export default {

    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        authorize: async (credentials) => {
          try {
            let user = null
   
            const { email, password } = await signInSchema.parseAsync(credentials)
            console.log(email, password);

            // logic to verify if user exists
            const normalizedEmail = String(email).toLowerCase();
            console.log(normalizedEmail)
            user = await prisma.user.findUnique({
              where: {
                email: normalizedEmail
              }
            }).catch((err) => { return null }).then((res) => { return res }) as any 

            console.log(user)
            if (!user) {
              throw new Error('Usuario não encontrado');
            }

            const isValid = await bcrypt.compare(password, user.password);
            console.log(isValid)
            if (!isValid) {
              throw new Error('Senha inválida');
            }
            
            // return json object with the user data
            prisma.$disconnect()
            return user
          } catch (error) {
            if (error instanceof ZodError) {
              // Return `null` to indicate that the credentials are invalid
              return null
            }
          }
        }
      }),
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    
} satisfies NextAuthConfig


class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password"
}