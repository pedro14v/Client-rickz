import { getTextoDoAudio } from "@/functions/openai/IA/getTextoDoAudio";
import { put_getMensagem } from "@/functions/openai/IA/put_getMensagem";
import { gerarAudio } from "@/functions/openai/IA/gerarAudio";
import { threadId } from "worker_threads";
import { getFileUrlAudio } from "./getFileUrlAudio";



export const audio_main_function = async ({file_id, User} : {file_id: string, User: any}) => {
    const audio = await getFileUrlAudio(file_id) as any;
    console.log(audio);
    if(!audio) return null;
    
    const texto = await getTextoDoAudio({audio: audio.urlAudio});
    if(!texto) return null;

    const resposta = await put_getMensagem({msg: texto, threadUser: User.thread , assistantId: User.assistantId}) as any;


    const createAudio = await gerarAudio({texto: resposta});
    // const createAudio = await gerarAudio({texto: resposta, User});


    return createAudio;
}