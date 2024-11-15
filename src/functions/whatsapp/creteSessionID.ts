'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export const createSessionID = async (userId: any, assistenteId: any) => {
    const sessionId = generateSessionId(20)
    console.log('sessionId:', sessionId)
    console.log('assistenteId:', assistenteId)
    var sessionID = await prisma.sessionWhatsapp.findUnique({
        where: {
            userId: userId
        },
        select: {
            sessionId: true
        }
    }).catch((err: any) => { return null }).then((res: any) => { return res }) as any

    if(!sessionID){
        const sessionWhatsapp = await prisma.sessionWhatsapp.create({
            data: {
                sessionId: sessionId,
                assistenteId: assistenteId.assistenteId,
                User: {
                    connect: {
                        id: userId
                    }
                }
            }
        })
    }

    return sessionId

}

function generateSessionId(length : number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let sessionId = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        sessionId += characters[randomIndex];
    }
    return sessionId;
}