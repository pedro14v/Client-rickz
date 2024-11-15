'use server'
import { PrismaClient } from "@prisma/client"   
import { stat } from "fs";
import z from "zod";
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const schemaRegistro = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    nameBusiness: z.string().optional(), // Tornando opcional inicialmente
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').max(16, 'A senha deve ter no máximo 16 caracteres'),
    confirmPassword: z.string(),
    membroToken: z.string().optional()
}).passthrough()
.refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
})
.refine(data => {
    // Se membroToken não existir, nameBusiness é obrigatório
    if (!data.membroToken && !data.nameBusiness) {
        return false;
    }
    return true;
}, {
    message: "Nome da empresa é obrigatório",
    path: ["nameBusiness"]
});

export const createUser = async (data: any) => {
    console.log(data)
    try{
        const verify = schemaRegistro.safeParse(data)
        console.log(verify)
        var role = 'ADMIN' , token = data.membroToken || 'mbr_'+uuid()
        if(data?.membroToken) {
            console.log(token)
            const members = await prisma.member.findFirst({
                where: {
                    token: data.momberToken,
                    userEmail: data.email
                }
            }).catch((err) => { return null }).then((res) => { return res }) as any


            if(!members) {
                return { status: 'error', message: 'Token inválido ou email não cadastrado' }
            }

            role = members.role
        }
        console.log(token)
        console.log(role)


        const user = await prisma.user.create({
            data: {
                email: data.email,
                whatsapp: data.whatsapp,
                password: await bcrypt.hash(data.password, 10),
                name: data.name,
                role: role,
                token: token
            }
        })


        if(role === 'ADMIN') {
            const member = await prisma.member.create({
                data: {
                    userEmail: data.email,
                    nameBusiness: data.nameBusiness,
                    role: 'ADMIN',
                    token: token,
                    User: {
                        connect: {
                            id: user.id
                        }
                    }
                }
            })
        }

        prisma.$disconnect()
        return {
            status: 'success',
            message: 'Usuário criado com sucesso'
        }

    } catch (error) {
        console.log(error)
        prisma.$disconnect()
        return {
            status: 'error',
            message: 'Erro ao criar usuário'
        }
    }
}