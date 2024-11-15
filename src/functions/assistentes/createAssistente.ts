'use server'
import { PrismaClient } from "@prisma/client"
import { createAssistenteGPT } from "@/functions/openai/assistente"
const prisma = new PrismaClient()
import { createSessionID } from "@/functions/whatsapp/creteSessionID"
import { uuid } from 'uuidv4'

interface AssistenteGPTResponse {
    status: 'success' | 'error',
    data: {assistenteId: string , vectorStore: string}
}

export const createAssistente = async ({nome , userId, token} : {nome: string , userId: string , token : string}) => {
    const num1at10 = Math.floor(Math.random() * 6) + 1;

    var assistenteGPT : AssistenteGPTResponse = await createAssistenteGPT('Assistente '+nome, 'email', 'password') as AssistenteGPTResponse
    let i = 0;
    while(assistenteGPT.status === 'error'){
        i++;
        assistenteGPT = await createAssistenteGPT('Assistente '+nome, 'email', 'password') as AssistenteGPTResponse
        if(assistenteGPT.status === 'success' || i === 5 ) break;
    }

    console.log(assistenteGPT)


    console.log(assistenteGPT.data.vectorStore)
    const [newAssistente , seesionWhats] =  await Promise.all([
        prisma.assistente.create({
            data: {
                userId: userId,
                authToken: uuid() + uuid(),
                nome: 'Assistente '+nome,
                image: `/perfil-img-default/${num1at10}.webp`,
                assistenteIdGPT: assistenteGPT.data.assistenteId,
                vectorStore: assistenteGPT.data.vectorStore,
                userToken: token
            }
        }),
        createSessionID(userId, assistenteGPT.data)
    ])
    

    return newAssistente.id
}