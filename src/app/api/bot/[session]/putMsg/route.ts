import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { put_getMensagem } from "@/functions/openai/put_getMensagem";

export async function POST(req: NextRequest, res: any) {
    const body = await req.json() as any
    const sessionId = req.headers.get('Session-Id')
    const { text , assistenteId , threadId } = body as any

    console.log('msg:', text)
    console.log('assistantId:', assistenteId)
    console.log('sessionId:', sessionId)


    const session = await prisma.sessionWhatsapp.findUnique({
        where: {
            sessionId: sessionId as string
        }
    }).catch((err: any) => { return null }).then((res: any) => { return true }) as any
    console.log('session:', session)

    if (!session) {
        return new Response('session not found', { status: 404 });
    }

    console.log('ping:' , text, threadId, assistenteId)
    const msg = await put_getMensagem({ msg: text, threadUser: threadId, assistantId: assistenteId })


    console.log('text:', msg)

    return new Response(JSON.stringify(msg), { status: 200 });

}