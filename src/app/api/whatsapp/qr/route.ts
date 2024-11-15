// import { initializeClient } from '@/lib/whatsappClient';
import  { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // const qr = initializeClient().qrCode;
    // console.log('GET QR Code:', qr);
    // if (qr) {
    //     // Gera uma imagem do QR Code
    //     const qrImage = await qrcode.toDataURL(qr);
    //     console.log('QR Code generated');
    //     return new Response(JSON.stringify({ qrImage }), { status: 200 });
    // } else {
    //     return new Response(JSON.stringify({ error: 'QR Code not available' }), { status: 500 });
    // }

    return new Response('ok')
}