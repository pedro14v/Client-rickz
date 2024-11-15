'use server'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const deleteMember = async ({id} : {id: string}) => {

    try {
        const member = await prisma.member.delete({
            where: {
                id
            }
        }).finally(() => {
            prisma.$disconnect()
        })

        return {
            status: 'success',
            message: 'Membro deletado com sucesso'
        }
    } catch (error) {
        console.log(error)
        return {
            status: 'error',
            message: 'Erro ao deletar membro'
        }
    }


}