import type { NextRequest } from "next/server";
import { Telegraf } from "telegraf";

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

import OpenAI from "openai";


import { texto_main_function } from "@/functions/openai/texto_main_function";
import { audio_main_function } from "@/functions/openai/audio_main_function";
import { imagem_main_function } from "@/functions/openai/imagem_main_function";
import { userSessionTelegramMsgs } from "@/functions/telegram/userSessionTelegramMsgs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const bot = new Telegraf(process.env.BOT_TOKEN as string);

export const POST = async (req: NextRequest) => {
    const data = await req.json();
    const tokenID = String(req.nextUrl.pathname).replace("/api/telegram/webhook/", "")
    console.log(tokenID);

    const telegramID = data?.message?.chat?.id;
    const message = data?.message
    
    if(!telegramID || !message) return new Response("ok");

    const sessionTelegram = await prisma.sessionTelegram.findUnique({
        where: {
            sessionId: tokenID
        }
    })

    if(!sessionTelegram) return new Response("ok");

    const User = await userSessionTelegramMsgs({telegramID: telegramID, tokenID: tokenID as string, assistenteId: sessionTelegram.assistenteId}) as any

    if(!User) return new Response("ok");

    const { text, voice, photo, caption } = message;

    var resposta = null;

    if(text) resposta = await texto_main_function({text: text, thread: User.threadId, assistantId: sessionTelegram.assistenteId});
    console.log(resposta);
    if(voice) resposta = await audio_main_function({file_id: voice.file_id, User});
    if(photo) resposta = await imagem_main_function({file_id: photo[0].file_id, caption: caption, User});

    if(!resposta) {
        bot.telegram.sendMessage(telegramID, "Opss o Felipe não me ensinou a responder isso ainda, mas ele já foi avisado e logo vai me ensinar.Para podermos conversar melhor, me envie um texto, uma imagem ou um áudio.")
        return new Response("ok");
    }
    
    if(voice) {
        bot.telegram.sendVoice(telegramID, resposta)
            .catch((err) => console.log(err));

        return new Response("ok");
    }


    bot.telegram.sendMessage(telegramID, resposta)
    return new Response("ok");

}

