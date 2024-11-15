'use server'
const axios = require('axios');

export const downloadMedia = async (url: string): Promise<string | null> => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) {
        console.error(`Error downloading media: ${error}`);
        return null;
    }
}
