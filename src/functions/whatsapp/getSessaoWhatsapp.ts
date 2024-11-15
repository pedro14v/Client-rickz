'use server'
import { PrismaClient } from "@prisma/client"
import { gerarThread } from "../openai/IA/gerarThread"
const prisma = new PrismaClient()



export const getSessaoWhatsapp = async ({userPhone, sessionId, assistenteId, status }: {userPhone: number, sessionId: string, assistenteId: any, status: boolean}) => {

    var newStatus = status ? 'Ativo' : 'Inativo'

    var session = await prisma.sessionWhatsappMsgs.findUnique({
        where: {
            userPhone : String(userPhone)
        }

    }).catch((err : any) => { return null }).then((res : any) => { return res }) as any

    
    if(!session){

        const newThread = await gerarThread()

        session = await prisma.sessionWhatsappMsgs.create({
            data: {
                sessionId: sessionId,
                userPhone: String(userPhone),
                threadId: newThread,
                status: newStatus,
                assistenteId: assistenteId,
            }
        })
    }

    return session
}