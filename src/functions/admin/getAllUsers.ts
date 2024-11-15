'use server'
import { PrismaClient } from "@prisma/client"
import email from "next-auth/providers/email"

const prisma = new PrismaClient()

export const getAllUsers = async ({email,qtd}: {email: string, qtd: number}) => {

    const verifyAdmin = await prisma.admin.findUnique({
        where: {
            userEmail: email
        }
    }).catch(() => {
        return false
    }).then(() => {
        return true
    })

    if(verifyAdmin){

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
                Assistente: true,
                Creditos: true
            },
        })
        console.log(users)
        return users
    }

    return null
}