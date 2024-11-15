'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const updateUser = async ({idAdmin , idUser, data}: {idAdmin: string, idUser: string, data: {nome: string, email: string, role: string, Creditos: number}}) => {
    console.log('idAdmin:', idAdmin)
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

        const users = await prisma.user.update({
            where: {
                id: idUser
            },
            data: {
                name: data.nome,
                email: data.email,
                role: data.role,
                Creditos: {
                    update: {
                        where: {
                            userId: idUser // Especifica o registro relacionado a ser atualizado
                        },
                        data: {
                            creditos: Number(data.Creditos)
                        }
                    }
                }
            }
        }).then(() => {
            return {
                status: 'success',
                message: 'Usuário atualizado com sucesso'
            }
        }).catch((error) => {
            console.log('error:', error )
            return {
                status: 'error',
                message: 'Erro ao atualizar usuário'
            }
        })

        return users
    }

    return {
        status: 'error',
        message: 'Você não tem permissão para atualizar usuários'
    }
}