'use server'
import Modelos from "@/functions/openai/models.json";
import { PrismaClient } from "@prisma/client";
import ComunicacaoPrompt from "@/functions/openai/comunicacaoPrompt.json"

const prisma = new PrismaClient();
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export const editarAssistenteGPT = async ({nome, treinamento, modelo , id} : {
    id: string,
    nome: string,
    treinamento: string,
    modelo: string
}) => {

    await openai.beta.assistants.update(
        id,
        {
            instructions: treinamento,
            name: nome,
            model: modelo,
        }
    ).catch(err => {
        console.log('[editarAssistenteGPT]:'+err)
    })


    return 'ok';

}

export const createAssistenteGPT = async (nome: string, email: string, password: string) => {

    const vectorStore = await openai.beta.vectorStores.create({
        name: "Vector-Store " + nome,
    });

    const model = Modelos['GPT-3.5 TURBO']
    console.log(model)
    try {
        const assistente = await openai.beta.assistants.create({
            instructions:`
                Você sempre responderá em apenas um JSON, ou seja, cada mensagem recebida so pode ter como resposta apenas um JSON.

                Voce sempre retornara sua resposta como se fosse para o whatsapp por cada mensagem retornara dentro de "resposta" em array e uma ação, siga exatamente esse exemplo, para enviar apenas uma mensagem no whatsapp:
                {
                    "resposta": ["resposta"],
                    "acao": "acao"
                }
            
                Caso tenha mais de uma mensagem, você pode retornar mais mensagens dentro do array, exemplo:
                {
                    "resposta": ["resposta1", "resposta2"],
                    "acao": "acao"
                }
                ${ComunicacaoPrompt['FORMAL']}

                Caso tenha arquivos disponiveis, consultar no vectorStore ${vectorStore.id}.
                \n\n
            `,
            name: nome,
            model: 'gpt-4o-mini',
            // response_format: { "type": "json_object" },
            tools: [{ type: "file_search" }],
            tool_resources: {
                file_search: {
                  vector_store_ids: [vectorStore.id]
                }
            },
            temperature: 0.1,
            top_p: 1,

        });
        console.log(assistente)
        return {
            status: 'success',
            data: {
                assistenteId: assistente.id,
                vectorStore: vectorStore.id
            }

        }
    } catch (error: any) {
        return {
            status: 'error',
            data: error.message
        }
    }
}