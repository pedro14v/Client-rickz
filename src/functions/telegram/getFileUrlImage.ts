import axios from 'axios';
const cloudinary = require('cloudinary');

cloudinary.v2.config({
  cloud_name: 'dd54otx5i',
  api_key: '731769511189473',
  api_secret: '_aPdmNjEYRNWZcwE5JL6UoM_Rkk',
  secure: true,
});

const tokenBot = process.env.BOT_TOKEN;

export const getFileUrlImage = async (fileId: string) => {
    try {
        const url = `https://api.telegram.org/bot${tokenBot}/getFile?file_id=${fileId}`;
        const response = await axios.get(url);
        
        if (!response.data.ok) {
            console.error('Failed to get file path');
            return null;
        }

        const downloadUrl = `https://api.telegram.org/file/bot${tokenBot}/${response.data.result.file_path}`;
        const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        console.log('fileResponse', fileResponse);
        var mimeType = fileResponse.headers['content-type'];
        console.log('mimeType', mimeType);
        const buffer = Buffer.from(fileResponse.data, 'binary').toString('base64');
        

        const cloudinaryResponse = await cloudinary.v2.uploader.upload(`data:${mimeType};base64,${buffer}`, {
            folder: 'PROJETO_FELIPE',
            format: 'jpeg',
        });

        // converter para jpeg
        let urlImage = cloudinaryResponse.secure_url;
        if (urlImage.endsWith('.jpg')) {
            urlImage = urlImage.replace('.jpg', '.jpeg');
        }


        mimeType = cloudinaryResponse.format;

        console.log('urlImage', urlImage);

        return { url:urlImage, mimeType:'image/jpeg' };
    } catch (error) {
        console.error('Error in getFileUrl:', error);
        return null;
    }
};
