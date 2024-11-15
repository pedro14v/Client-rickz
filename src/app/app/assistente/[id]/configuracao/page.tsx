'use client'
import React, { useState,useEffect } from 'react';
import { useForm, SubmitHandler, set } from "react-hook-form"
import Image from 'next/image'; 
import { IconPhotoPlus, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { getAssistente } from '@/functions/assistentes/getAssistente';
import { updateAssistente } from '@/functions/assistentes/updateAssistente';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/Button';
import { useSession } from 'next-auth/react';
export default function PerfilAssistente ({params}: Readonly<{params: {id: string}}>) {
    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
    const { data: session , status , update } = useSession() as any;
    const [assistente, setAssistente] = useState([]) as any;
    const [msgUpdate, setMsgUpdate] = useState({}) as any;
    useEffect(() => {
        (async () => {
            const response = await getAssistente({id: params.id}) as any;
            setValue('nome', response?.nome);
            setValue('comunicacao', String(response?.comunicacao).toUpperCase());
            setValue('modelo', String(response?.modelo).toUpperCase());
            setValue('finalidade', String(response?.finalidade).toUpperCase());
            setAssistente(response);
        })()
    } , [])


    const atualizareAssistente = async () => {
        console.log(watch('nome'))
        const response = await updateAssistente({
            id: params.id,
            assistenteId: assistente.assistenteIdGPT,
            nome: watch('nome'),
            comunicacao: watch('comunicacao'),
            modelo: watch('modelo'),
            finalidade: watch('finalidade'),
            treinamento: assistente?.treinamento
        }) as any;

        setMsgUpdate(response);

        setTimeout(() => {
            setMsgUpdate({})
        }, 10000)

    }

    if(assistente.length === 0) return <Loading />;
    return (
        <>
            

            <div className='w-full flex h-auto  items-start justify-center gap-10 '>
                <div className='relative flex flex-col items-center justify-start w-auto h-auto '>
                    <Image width={100} height={100} alt='imagem perfil assistente' className='font-bold text-white size-20 rounded-full items-center justify-center flex bg-black border-2 border-black ' src={assistente.image || '/perfil-img-default/1.webp'} / >
                    {/* <input type='file' className='hidden' />
                    <label className='absolute bottom-[-5px] right-[-5px]  text-black' htmlFor='file' >
                        <IconPhotoPlus stroke={2} className='size-6' />
                    </label> */}
                </div>
                <div className='flex flex-col items-start justify-center w-auto h-auto '>
                    <span className='font-bold text-black rounded-full items-center justify-center flex '>
                        Nome do Assistente:
                    </span>
                    <input className={`w-full p-2 border-b-2  border-dotted h-10 bg-transparent ${watch('nome').length <= 20 && watch('nome').length !== 0  ? 'border-black' : 'border-red-500' }  `} defaultValue={assistente[0]?.nome} {...register('nome')} />
                    <span className='font-bold text-black rounded-full items-center justify-center flex text-xs '>
                        {watch('nome').length} / 20
                    </span>
                </div>
                
            </div>
            
            <div className='w-full flex flex-col h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md p-1 '>
                <span className='font-bold text-lg text-black text-start items-start justify-start flex w-full px-2 '>
                    Comunicação:
                </span>
                <span className=' font-extralight text-xs text-black text-start items-start justify-start flex w-full px-2 '>
                    Selecione o tipo de comunicação que deseja que seu assistente possa realizar
                </span>
                <div className='flex items-center justify-start w-full h-20 '>
                    <input type="radio" className='hidden'  id='FORMAL' value={'FORMAL'} {...register('comunicacao')} />
                    <label className={`p-1 m-2 text-center rounded-md ${watch('comunicacao') === 'FORMAL'? 'shadow-blue-500' : 'shadow-gray-600'} text-black font-semibold w-40 shadow-md  cursor-pointer `} htmlFor='FORMAL' >
                        FORMAL
                    </label>
                    <input type="radio" className='hidden'  id='NORMAL' value={'NORMAL'} {...register('comunicacao')} />
                    <label className={`p-1 m-2 text-center rounded-md ${watch('comunicacao') === 'NORMAL'? 'shadow-blue-500' : 'shadow-gray-600'} text-black font-semibold w-40 shadow-md cursor-pointer `} htmlFor='NORMAL' >
                        NORMAL
                    </label>
                    <input type="radio" className='hidden'  id='INFORMAL' value={'INFORMAL'} {...register('comunicacao')} />
                    <label className={`p-1 m-2 text-center rounded-md ${watch('comunicacao') === 'INFORMAL'? 'shadow-blue-500' : 'shadow-gray-600'}  text-black font-semibold w-40 shadow-md cursor-pointer `} htmlFor='INFORMAL' >
                        INFORMAL
                    </label>
                </div>
            </div>
            <div className='w-full flex flex-col h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md p-1 '>
                <span className='font-bold text-lg text-black text-start items-start justify-start flex w-full px-2 '>
                    Modelo de IA:
                </span>
                <span className=' font-extralight text-xs text-black text-start items-start justify-start flex w-full px-2 '>
                    Selecione o tipo de modelo de IA que deseja que seu assistente possua
                </span>
                <div className='flex items-center justify-start w-full h-20 '>
                    <select className='w-60 p-2 px-5 rounded-lg border-2 border-black border-dotted h-10 mb-5 bg-transparent ' {...register('modelo')} >
                        <option value="GPT-3.5 TURBO">GPT-3.5 TURBO</option>
                        <option value="GPT-4o">GPT-4o</option>
                        <option value="GPT-4 TURBO">GPT-4 TURBO</option>
                    </select>
                </div>
            </div>


            <div className='w-full flex flex-col h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md p-1 '>
                <span className='font-bold text-lg text-black text-start items-start justify-start flex w-full px-2 '>
                    Finalidade:
                </span>
                <span className=' font-extralight text-xs text-black text-start items-start justify-start flex w-full px-2 '>
                    Selecione a finalidade do seu assistente
                </span>
                <div className='flex items-center justify-start w-full h-auto '>
                    <input type="radio" className='hidden'  id='SUPORTE' value={'SUPORTE'} {...register('finalidade')} />
                    <label className={` flex p-1 m-2 text-center rounded-md ${watch('finalidade') === 'SUPORTE' ? 'shadow-blue-500' : 'shadow-gray-600'} text-black font-semibold w-96 shadow-md cursor-pointer `} htmlFor='SUPORTE' >
                        <Image src={'/icon/icon-suporte.svg'} width={100} height={100} alt='Auth Image' className='size-14' />
                        <div className='flex flex-col items-start justify-center gap-1 '>
                            <span className='font-bold'>SUPORTE</span>
                            <span className='font-light text-xs text-start '>Use essa opção sempre que o objetivo do seu assistente for prestar suporte.</span>
                        </div>
                    </label>
                    <input type="radio" className='hidden'  id='VENDAS' value={'VENDAS'} {...register('finalidade')} />
                    <label className={` flex p-1 m-2 text-center rounded-md ${watch('finalidade') === 'VENDAS' ? 'shadow-blue-500' : 'shadow-gray-600'} text-black font-semibold w-96 shadow-md  cursor-pointer `} htmlFor='VENDAS' >
                        <IconShoppingCart stroke={1} className='size-14' />
                        <div className='flex flex-col items-start justify-center gap-1 '>
                            <span className='font-bold'>VENDAS</span>
                            <span className='font-light text-xs text-start '>Use sempre que quiser criar um assistente que tem como foco falar de um produto.</span>
                        </div>
                    </label>
                    <input type="radio" className='hidden'  id='USO PESSOAL' value={'USO PESSOAL'} {...register('finalidade')} />
                    <label className={` flex p-1 m-2 text-center rounded-md ${watch('finalidade') === 'USO PESSOAL' ? 'shadow-blue-500' : 'shadow-gray-600'}  text-black font-semibold w-96 shadow-md cursor-pointer `} htmlFor='USO PESSOAL' >
                        <IconUser stroke={1} className='size-14' />
                        <div className='flex flex-col items-start justify-center gap-1 '>
                            <span className='font-bold'>USO PESSOAL</span>
                            <span className='font-light text-xs text-start '>Escolha esta opção caso queira um assistente para uso pessoal afim de te ajudar em tarefas.</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className='w-auto min-w-40 min-h-20 flex items-center justify-center gap-5 absolute bottom-0 right-10'>
                {
                    session?.user?.role !== 'ATENDENTE' &&
                    <Button
                        functionGet={handleSubmit(atualizareAssistente)}
                        msgUpdate={msgUpdate}
                        text='Salvar'
                        disabled={false}
                    />
                }
                    
            </div>
        
        </>
    );
}
