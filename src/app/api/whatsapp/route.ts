import  { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let qrCodeCache: string | null = null;


export async function GET(req: NextRequest , res: NextResponse) {

  return new Response('ok')
};
