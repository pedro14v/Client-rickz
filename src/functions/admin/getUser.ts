'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getUser = async ({idAdmin , idUser}: {idAdmin: string, idUser: string}) => {

    const verifyAdmin = await prisma.admin.findUnique({
        where: {
            userEmail: idAdmin
        }
    }).catch(() => {
        return false
    }).then(() => {
        return true
    })

    if(verifyAdmin){

        const users = await prisma.user.findUnique({
            where: {
                id: idUser
            },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
                role: true,
                Assistente: true,
                Creditos: true
            },
        })
        console.log(users)
        return users
    }

    return null
}