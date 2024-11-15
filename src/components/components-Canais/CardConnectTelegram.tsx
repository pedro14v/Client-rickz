'use client'
import React , { useState, useEffect} from 'react';
import Image from 'next/image';
import { IconLineDotted, IconSettings, IconSquareX } from '@tabler/icons-react';
import { watch } from 'fs';
import { useForm } from 'react-hook-form';
import { set } from 'zod';
import { useSession } from 'next-auth/react';
import { setWebhook } from '@/functions/telegram/setWebhook';



export const CardConnectTelegram = ({setCanal, token, status , assistenteID }: {setCanal: any, token: string, status: 'Ativo' | 'Inativo' , assistenteID: string}) => {
    const [timer, setTimer] = useState<number>(15)
    const { register, watch } = useForm()
    const { data: session, status:statusSession, update } = useSession() as any
     console.log(session)
    const [ loading, setLoading ] = useState<{loading: boolean, message: string,status:string}>({loading: false, message: '', status: ''})

    useEffect(() => {
        if(status === 'Inativo' || status === undefined) return
        setTimeout(() => {
            setCanal('')
        }, 5000)
    }, [status])


    const newtWebhook = async () => {
        setLoading({loading: true, message: 'Conectando ao Telegram', status: 'loading'})
        var token = watch('token')
        console.log(session)
        const setNewWebhook = await setWebhook({token, assistenteID: assistenteID, userId: session.user.id})
        console.log(setNewWebhook)
        if(setNewWebhook) {
            setLoading({loading: false, message: 'Conectado com sucesso', status: 'success'})
            setTimeout(() => {
                setCanal('')
            }, 5000)

            return
        }

        setLoading({loading: false, message: 'Erro ao conectar', status: 'error'})
        
    }

    return (
        <div className='absolute top-0 left-0 w-full h-full flex flex-col  items-start justify-between py-10 backdrop-blur-xl rounded-md overflow-hidden shadow-md shadow-black px-10 z-30  '>
            <span className='w-full h-full absolute top-0 left-0 bg-black bg-opacity-20 z-[-10] '></span>
            <span className='w-auto h-auto absolute top-5 right-5 ' onClick={() => { setCanal('') } }>
                <IconSquareX className='size-10 text-black cursor-pointer ' />
            </span>
            <div className='w-full h-auto flex flex-col items-start justify-between '>
                <div className='w-full h-20 flex items-center justify-start px-5 gap-5 '>
                    <Image src='/icon/icon-telegram.webp' width={100} height={100} alt='Icon-whatsapp' className='size-16' />
                    <span className='font-bold text-lg text-black items-center justify-center flex'>
                        Para vincular seu bot do telegram siga as instruções abaixo:
                    </span>
                </div>
                <div className='w-full h-auto flex items-center justify-start px-10 mt-10 text-lg font-medium '>
                    <ul className='gap-2 flex flex-col items-start justify-start' >
                        <li className='flex flex-wrap items-center' >1. Abra <a href='https://t.me/BotFather' className='mx-1 text-blue-600 '>@BotFather</a>  no Telegram e clique em <b className='ml-1' >/start</b></li>
                        <li className='flex flex-wrap items-center' >2. Envie <b className='ml-1' >/newbot</b> e siga as instruçõe</li>
                        <li>3. Quando o bot for criado, você receberá uma mensagem com o token. Copie o token e cole-o aqui</li>
                    </ul>
                </div>
                <span></span>
            </div>
            <div className='w-full h-32 flex flex-col items-start justify-start px-5 gap-5 '>
                <span className='font-bold' >Token do bot do Telegram</span>
                <input type='text' className='w-full h-10 rounded-md shadow-md shadow-black p-2 truncate ' {...register('token')} />
                <button className={`w-80 h-10 bg-blue-600 text-white rounded-md shadow-md shadow-black ${loading.status === 'success' && 'bg-green-600' } ${loading.status === 'error' && 'bg-green-600' } `} onClick={() => { newtWebhook() }} disabled={loading.loading} >
                    {
                        loading.loading ? 
                        <span className={`flex items-center justify-center gap-1 `} >
                            <span className='size-10 animate-spin border-yellow-600 border-y-2 border-r-2 rounded-full p-1 ' />
                            <span>{loading.message}</span>
                        </span>
                        :
                        <span>Conectar</span>
                    }
                </button>
            </div>
            


        </div>
    )
}
