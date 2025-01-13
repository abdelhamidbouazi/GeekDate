'use server'
 
import { cookies } from 'next/headers'
 
export async function setToken(token) {
    const cookieStore = await cookies()

    cookieStore.set('token', token)
}