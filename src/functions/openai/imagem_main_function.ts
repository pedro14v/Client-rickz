import { transcribeImage } from "@/functions/openai/IA/transcribeImage"
import { put_getMensagem } from "@/functions/openai/put_getMensagem"
import { getFileUrlImage } from "@/functions/telegram/getFileUrlImage"






export const imagem_main_function = async ({file_id,caption, User} : {file_id: string, User: any , caption: string}) => {
    console.log(file_id);
    console.log(caption)    
    const image = await getFileUrlImage(file_id) as any;
    if(!image) return null;
    
    console.log(image);
    // const texto = await transcribeImage({image: image.url});
    // if(!texto) return null;
    console.log(image.url);
    const resposta = await put_getMensagem({msg: caption, threadUser: User.thread , assistantId: User.assistantId}) as any;

    return resposta;


}