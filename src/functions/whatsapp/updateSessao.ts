'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()



export const updateSessao = async ({sessionId, status}: {sessionId: string, status: 'Ativo' | 'Inativo'}) => {
    console.log('updateSessao:', sessionId, status)
    const session = await prisma.sessionWhatsapp.update({
        where: {
            sessionId: sessionId
        },
        data: {
            status: status
        }
    }).catch((err : any) => { return console.log(err) }).then((res : any) => { return res }) as any

    return session
}