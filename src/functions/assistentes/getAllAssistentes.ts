'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getAllAssistentes = async ({userId} : {userId: string}) => {
    console.log('[getAllAssistentes userId ]: ', userId)
    const allAssistentes = await prisma.assistente.findMany({
        where: { userId: userId },
        select: {
            status: true,
            nome: true,
            id: true,
            userId: true,
            image: true,
        }
    }).catch(err => {
        console.log(err)
        return []
    })

    console.log('[getAllAssistentes allAssistentes ]: ', allAssistentes)


    return allAssistentes
}