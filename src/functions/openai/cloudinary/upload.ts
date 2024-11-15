'use server'
import cloudinary from 'cloudinary';
import { set } from 'zod';

cloudinary.v2.config({
    cloud_name: "dd54otx5i", 
    api_key: "498662169186132", 
    api_secret: "eIdv2AlGpxiRbsT2MDYGDDTqAm4" // Click 'View Credentials' below to copy your API secret
});


export const upload = async (file: any, tipo : 'image' | 'video', extensao : 'image/jpeg' | 'audio/mp3' | 'audio/opus' ) => {
    const uploadResult = await cloudinary.v2.uploader.upload(`data:${extensao};base64,${file}`, {
        folder: "PROJETO_FELIPE",
        resource_type: tipo 
    });

    // excluir apos 2 minutos
    setTimeout(() => {
        cloudinary.v2.uploader.destroy(uploadResult.public_id, {
            resource_type: tipo
        });
    }, 120000);


    return uploadResult;
};