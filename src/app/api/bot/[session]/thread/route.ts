import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { gerarThread } from "@/functions/openai/IA/gerarThread";

export async function GET(req: NextRequest, res: any) {
    console.log('req.query:', req)
    const sessionId = req.headers.get('Session-Id')

    const session = await prisma.sessionWhatsapp.findUnique({
        where: {
            sessionId: sessionId as string
        }
    }).catch((err: any) => { return null }).then((res: any) => { return true }) as any

    if (!session) {
        return new Response('session not found', { status: 404 });
    }

    const thread = await gerarThread()

    

    return new Response(JSON.stringify(thread), { status: 200 });

}