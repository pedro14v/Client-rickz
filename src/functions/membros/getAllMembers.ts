'use server'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllMembers = async ({userId} : {userId: string}) => {
    const members = await prisma.member.findMany({
        where: {
            userId
        }
    });
    prisma.$disconnect()
    return members;
}

