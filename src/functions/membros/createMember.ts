'use server'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const createMember = async ({userId, token, email, role, permissions} : {userId: string, token: string, email: string, role: string , permissions: any}) => {

    try {
        const member = await prisma.member.create({
            data: {
                userEmail: email,
                role,
                permissions,
                token,
                User: {
                    connect: {
                        id: userId
                    }
                }
            }
        }).finally(() => {
            prisma.$disconnect()
        })
        
        return {
            status: 'success',
            message: 'Membro criado com sucesso'
        }
    } catch (error) {
        console.log(error)
        return {
            status: 'error',
            message: 'Erro ao criar membro'
        }
    }


}