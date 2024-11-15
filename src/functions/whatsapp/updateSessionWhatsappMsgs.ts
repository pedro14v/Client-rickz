'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()



export const updateSessionWhatsappMsgs = async ({phone, status}: {phone: string, status: 'Ativo' | 'Inativo'}) => {
    console.log('-------------------[updateSessionWhatsappMsgs] ------------------:', phone, status)
    const session = await prisma.sessionWhatsappMsgs.update({
        where: {
            userPhone: phone 
        },
        data: {
            status: status
        }
    }).catch((err : any) => { return null }).then((res : any) => { return res }) as any

    return session
}