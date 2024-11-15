'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const deleteAssistente = async ({id} : {id: string}) => {

    const deleteAssistente = await prisma.assistente.delete({
        where: { id }
    }).then(() => {
        return {
            status: 'success',
            message: 'Assistente deletado com sucesso'
        }
    }).catch(() => {
        return {
            status: 'error',
            message: 'Erro ao deletar assistente'
        }
    }).finally(() => {
        prisma.$disconnect()
    })


    return deleteAssistente
}