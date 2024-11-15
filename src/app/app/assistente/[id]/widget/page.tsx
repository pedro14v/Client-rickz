'use client'
import React, { useState , useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form"
import Image from 'next/image'; 
import { IconShoppingCart, IconUser } from '@tabler/icons-react';
import { updateAssistente } from '@/functions/assistentes/updateAssistente';
import { getAssistente } from '@/functions/assistentes/getAssistente';
import { Button } from '@/components/Button';
import { useSession } from 'next-auth/react';
import * as zlib from 'zlib';
import CodeWidget from '@/components/widget/CodeWidget';
import TokenWidget from '@/components/widget/TokenWidget';


export default function PerfilAssistente ({params}: Readonly<{params: {id: string}}>) {
    console.log(params)
    const { update } = useSession();
    const { register, handleSubmit, watch, formState: { errors } , setValue } = useForm();

    const [assistente, setAssistente] = useState([]) as any;
    const [msgUpdate, setMsgUpdate] = useState({}) as any;
    
    useEffect(() => {
        (async () => {
            const response = await getAssistente({id: params.id}) as any;
            console.log(response);
            const descompressed = response.treinamento ? zlib.gunzipSync(Buffer.from(response.treinamento, 'base64')).toString() : '';
            console.log(descompressed)
            setValue('treinamento', descompressed.replace(/(?:\r\n|\r|\n)/g, '\n'));
            setAssistente(response);
        })()
    } , [])

    const atualizareAssistente = async () => {

        const compreesed = zlib.gzipSync(watch('treinamento')).toString('base64');
        console.log(compreesed)

        const response = await updateAssistente({
            id: params.id,
            nome: assistente?.nome,
            comunicacao: assistente?.comunicacao,
            modelo: assistente?.modelo,
            finalidade: assistente?.finalidade,
            treinamento: compreesed,
            assistenteId: assistente?.assistenteIdGPT
        }) as any;

        setMsgUpdate(response);


        await update();


        setTimeout(() => {
            setMsgUpdate({})
        }, 10000)

    }
    return (
        <>
            <div className='w-full flex flex-col h-auto  items-start justify-center border-b border-gray-600 py-2 '>
                <span className='font-bold text-black rounded-full items-center justify-center flex text-xl '>
                    Widget
                </span>
                <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs '>
                    Utilize o código abaixo para adicionar o widget em seu site
                </span>
            </div>
            <pre className='w-full shadow-sm shadow-[--azul] rounded-md '>
                <TokenWidget token={assistente?.authToken} />
            </pre>
            <pre className='w-full shadow-sm shadow-[--azul] rounded-md '>
                <CodeWidget id={params.id} />
            </pre>    
        
        </>
    );
}
