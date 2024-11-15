'use client'
import React , { useState, useEffect} from 'react';
import Image from 'next/image';
import { IconLineDotted, IconSettings, IconSquareX } from '@tabler/icons-react';



export const CardConnect = ({setCanal, qrCode, status }: {setCanal: any, qrCode: string, status: 'Ativo' | 'Inativo' }) => {
    const [timer, setTimer] = useState<number>(15)

    useEffect(() => {
        if(status === 'Inativo' || status === undefined) return
        setTimeout(() => {
            setCanal('')
        }, 5000)
    }, [status])


    return (
        <div className='absolute top-0 left-0 w-full h-full flex  items-center justify-start backdrop-blur-xl rounded-md overflow-hidden shadow-md shadow-black px-10 z-30  '>
            <span className='w-full h-full absolute top-0 left-0 bg-black bg-opacity-20 z-[-10] '></span>
            <span className='w-auto h-auto absolute top-5 right-5 ' onClick={() => { setCanal('') } }>
                <IconSquareX className='size-10 text-black cursor-pointer ' />
            </span>
            <div className='w-4/5 h-auto flex flex-col items-start justify-between '>
                <div className='w-full h-20 flex items-center justify-start px-10 gap-5 '>
                    <Image src='/icon/icon-whatsapp.png' width={100} height={100} alt='Icon-whatsapp' className='size-16' />
                    <span className='font-bold text-lg text-black items-center justify-center flex'>
                        Para vincular seu whatsapp siga as instruções abaixo:
                    </span>
                </div>
                <div className='w-full h-auto flex items-center justify-start px-10 mt-10 text-lg font-medium '>
                    <ul className='gap-2 flex flex-col items-start justify-start' >
                        <li>1. Abra o WhatsApp no seu telefone</li>
                        <li className='flex flex-wrap items-center' >2. <b className='ml-1' >Toque no menu</b><b><IconLineDotted className='size-6 rotate-90 ' /></b>  ou em <b className='m-1' >configurações</b><b><IconSettings className='size-6 rotate-90 mr-1 ' /></b> e selecione Aparelhos conectados</li>
                        <li>3. Toque em <b>Conectar um aparelho</b></li>
                        <li>4. Aponte seu telefone para este QR Code</li>
                    </ul>
                </div>
                <span></span>
            </div>
            <div className='flex flex-col items-center justify-center gap-5 w-auto h-full ' >
                <span className='font-bold' >Conecte seu Whatsapp</span>
                {
                    qrCode !== '' ? <Image src={qrCode} alt="QR Code" width={300} height={300} quality={100} className={`bg-white ${status === 'Ativo' ? 'animate-pulse shadow-green-500 rounded-full shado size-40' : 'shadow-black p-4 rounded-lg shadow-xl size-60'} `} />
                : 
                    <span className='size-60 rounded-lg shadow-md shadow-black animate-pulse items-center justify-center flex ' >
                        <div className=' animate-spin border-b-2 border-black rounded-full h-20 w-20 '></div>
                    </span>
                }
                
            </div>
            


        </div>
    )
}
