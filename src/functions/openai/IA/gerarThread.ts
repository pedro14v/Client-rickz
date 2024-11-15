'use server'
import Openai from 'openai';

const openai = new Openai({
    apiKey: process.env.OPENAI_API_KEY,
});

export const gerarThread = async () => {
    console.log('gerarThread: ',process.env.OPENAI_API_KEY);
    const thread = await openai.beta.threads.create();
    return thread.id;
}