'use server'
import Openai from 'openai';
import fs from 'fs';
const openai = new Openai({
    apiKey: process.env.OPENAI_API_KEY,
});

export const uploadFile = async ({data}: {data: FormData}) => {
    const file = data.get('file') as File;
    const assistantId = data.get('assistantId');
    let vectorStoreId = data.get('vectorStore') as string;
    console.log(file);
    console.log(assistantId);
    console.log(vectorStoreId);
    if(!file || !assistantId || !vectorStoreId) return null
    const fileUpload = await openai.files.create({
        file: file,
        purpose: "assistants",
    }).catch((err) => console.log(err));
    console.log(fileUpload)
    
    if(!fileUpload) return null;
    console.log(fileUpload.id);
    const myVectorStoreFile = await openai.beta.vectorStores.files.create(
        vectorStoreId,
        {
          file_id: fileUpload.id,
        }
    ).catch((err) => console.log(err));

    if(!myVectorStoreFile) return null;

    console.log(myVectorStoreFile);

    return myVectorStoreFile;
}