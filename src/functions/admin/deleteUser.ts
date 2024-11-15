'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const deleteUser = async ({idAdmin , idUser}: {idAdmin: string, idUser: string}) => {

    const verifyAdmin = await prisma.admin.findUnique({
        where: {
            userEmail: idAdmin
        }
    }).catch(() => {
        return false
    }).then(() => {
        return true
    })
    
    if(verifyAdmin){

        const users = await prisma.user.delete({
            where: {
                id: idUser
            }
        }).then(() => {
            return {
                status: 'success',
                message: 'Usuário deletado com sucesso'
            }
        }).catch(() => {
            return {
                status: 'error',
                message: 'Erro ao deletar usuário'
            }
        })

        return users
    }

    return {
        status: 'error',
        message: 'Você não tem permissão para deletar usuários'
    }
}