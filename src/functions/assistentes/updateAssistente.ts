'use server'
import { PrismaClient } from "@prisma/client"
import { editarAssistenteGPT } from "@/functions/openai/assistente"
import ComunicacaoPrompt from "@/functions/openai/comunicacaoPrompt.json"
import Modelos from "@/functions/openai/models.json";

const prisma = new PrismaClient()

export const updateAssistente = async ({nome, comunicacao, finalidade, treinamento, modelo , id, assistenteId, treinamentoURL} : {
    id: string,
    nome: string, 
    comunicacao: 'FORMAL' | 'INFORMAL' | 'NORMAL', 
    finalidade: 'SUPORTE' | 'VENDAS' | 'USO PESSOAL' ,
    treinamento: string, 
    treinamentoURL?: string,
    modelo: 'GPT-3.5 TURBO' | 'GPT-4o' | 'GPT-4 TURBO',
    assistenteId: string
}) => {
    var promptTreinamento = `
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
        ${ComunicacaoPrompt[comunicacao]}\n\n
        ${treinamento}
        ${treinamentoURL && `Para mais informações, abaixo tem o texto extraído do site:\n\n${treinamentoURL}` }
    `
    var newModelo = Modelos[modelo]

    const [updateDB, updateGPT] = await Promise.all([
        prisma.assistente.update({
            where: { id: id },
            data: {
                nome: nome,
                comunicacao : comunicacao,
                treinamento : treinamento,
                treinamentoHttp: treinamentoURL,
                finalidade : finalidade,
                modelo : modelo,
            }
        }).catch(err => {
            return {
                status: 'error',
                message: 'Erro ao atualizar assistente'
            }
        }).then(() => {
            return {
                status: 'success',
                message: 'Assistente atualizado com sucesso'
            }
        }),
        editarAssistenteGPT({nome: nome, treinamento: promptTreinamento, modelo: newModelo, id: assistenteId})
    ])



    return updateDB
}