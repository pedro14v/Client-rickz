'use server'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({ 
    cloud_name: 'dd54otx5i', 
    api_key: '498662169186132', 
    api_secret: 'eIdv2AlGpxiRbsT2MDYGDDTqAm4' // Click 'View Credentials' below to copy your API secret
}); 

export const uploadImg = async (file: any) => {
    try {
        const res = await cloudinary.uploader.upload(file, {
            folder: 'PROJETO_WHATSAPP_SAAS',
            use_filename: true,
            unique_filename: false
        }).then((result:any) => {
            console.log(result.secure_url)
            return result.secure_url
        }).catch((error:any) => {
            console.log(error)
            return null
        })


        return res
    } catch (error) {
        console.log(error)
    }
}