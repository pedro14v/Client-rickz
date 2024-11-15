import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { gerarThread } from "../openai/IA/gerarThread";

export const userSessionTelegramMsgs = async ({telegramID, tokenID , assistenteId } : {telegramID: string, tokenID: string , assistenteId: string}) => {

    let user = await prisma.sessionTelegramMsgs.findUnique({
        where: {
            telegramID: telegramID
        }
    })

    if(user) {
        user = await prisma.sessionTelegramMsgs.create({
            data: {
                telegramID: telegramID,
                sessionId: tokenID,
                assistenteId: assistenteId,
                threadId: await gerarThread()
            }
        })
    }


    return user;
}