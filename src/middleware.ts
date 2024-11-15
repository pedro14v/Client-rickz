import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


const { auth } = NextAuth(authConfig) as any;

const protectedRoutes = [
    /^\/app\/?.*/,
]

export default async function middleware(req: NextRequest) {
    const isAuthorized = req.cookies.getAll().some((cookie) => String(cookie.name).includes('authjs.session-token') || String(cookie.name).includes('__Secure-authjs.session-token')) ? true : false;

    const { pathname, origin } = req.nextUrl;

    const urlBase = origin

    const isProtectedRoute = protectedRoutes.some((route) => route.test(pathname));
    
    if (pathname.includes('png') || pathname.includes('jpg') || pathname.includes('jpeg') || pathname.includes('svg') || pathname.includes('webp')) {
        return NextResponse.next();
    }
 
    if(!isAuthorized) {
        console.log("Not authorized")
        return NextResponse.rewrite(new URL(`${urlBase}/auth`))
    }

    if(pathname === "/" && !isProtectedRoute) {
        return NextResponse.rewrite(new URL(`${urlBase}/app`))        
    }

    return NextResponse.rewrite(new URL(`${urlBase}/app${pathname}`))
}


export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};