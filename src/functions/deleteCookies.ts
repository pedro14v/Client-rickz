'use server'

import { cookies } from "next/headers"

export const deleteCookies = async (req: Request, res: Response) => {
    cookies().getAll().forEach(cookie => {
        cookie.name.includes('session-token') && cookies().delete(cookie.name)
    })
    return new Response('ok', { status: 200 })
}
    