'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const setWebhook = async ({token , assistenteID, userId} : {token: string, assistenteID: string, userId: string}) => {
    const url = process.env.URL_FRONTEND+'/api/telegram/webhook/'+token
    const setWebhook = await fetch('https://api.telegram.org/bot'+token+'/setWebhook?url='+url)
    const response = await setWebhook.json()
    console.log(response)

    if(response.ok === false) return false

    const bot = await prisma.sessionTelegram.upsert({
        where: {
            sessionId: token
        },
        create: {
            sessionId : token,
            assistenteId: assistenteID,
            User : {
                connect: {
                    id: userId
                }
            }
        },
        update: {
            sessionId : token,
            assistenteId: assistenteID,
            User : {
                connect: {
                    id: userId
                }
            }
        }
    })
    return bot
}