'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getAssistente = async ({id} : {id: string}) => {

    const newAssistente = await prisma.assistente.findUnique({
        where: { id }
    })


    return newAssistente
}


export const getAssistenteAuthToken = async ({authToken} : {authToken: string}) => {
    
    const newAssistente = await prisma.assistente.findUnique({
        where: { authToken }
    }).finally(() => {
        prisma.$disconnect()
    }).catch(() => {
        return null
    })

    return newAssistente
}