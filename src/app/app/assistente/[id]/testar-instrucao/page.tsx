'use client'
import React, { useState , useEffect, useRef } from 'react';
import { useForm, SubmitHandler, set } from "react-hook-form"
import Image from 'next/image'; 
import { IconSend, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { gerarThread } from '@/functions/openai/IA/gerarThread';
import { put_getMensagem } from '@/functions/openai/put_getMensagem';
import { useRouter } from 'next/navigation';
import { getAssistente } from '@/functions/assistentes/getAssistente';
const allmsg = [] as any;

export default function PerfilAssistente ({params}: Readonly<{params: {id: string}}>) {
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } , setValue } = useForm();
    const { data : session , status , update } = useSession() as any;
    
    const [thread, setThread] = useState<string | null>(null) as any;
    const [assistente, setAssistente] = useState() as any;
    const [msgUpdate, setMsgUpdate] = useState([]) as any;
    
    var imgUser = session?.user?.image;
    var imgAssistente = assistente?.image;

    

    // gerando thread
    useEffect(() => {
        if (status === 'authenticated') {
          (async () => {
            const [assistenteData, threadData] = await Promise.all([
              getAssistente({ id: params.id }),
              gerarThread()
            ]);
            console.log('threadData:', threadData)
            setThread(threadData);
            setAssistente(assistenteData);
          })();
        }
    }, [status, params.id]);


    // escutando a tecla enter
    useEffect(() => {
        const handleKeyDown = (e: any) => {
            if (e.key === 'Enter') {
                sendMsg()
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [msgUpdate])


    const sendMsg = async () => {
        const msg = watch('msgUser');
        allmsg.push({ msg: msg, role: 'user' });
        setMsgUpdate([...allmsg]);
        setValue('msgUser', '');
        console.log(session)
        var assistente_ = assistente;
        console.log('assistente_1:', assistente_)
        if(!assistente?.assistenteIdGPT) {
            assistente_ = await getAssistente({ id: params.id })
            console.log('assistente_2:', assistente_)
        }
        console.log(assistente_)
        const putMsg = await put_getMensagem({ threadUser: thread, msg: msg, assistantId: assistente_.assistenteIdGPT });
        console.log('putMsg:', putMsg)

        
        putMsg.forEach((i: any) => {
            allmsg.push({ msg: i, role: 'assistente' });
            setMsgUpdate([...allmsg])
        })

        const conteinerMsg = document.getElementById('conteiner-msg') as any;

        const observer = new MutationObserver(() => {
            conteinerMsg.scrollTop = conteinerMsg.scrollHeight;
        });

        observer.observe(conteinerMsg, {
            childList: true,
            subtree: true,
        });
    };


    return (
        <>
            <div className='w-full flex flex-col h-auto  items-start justify-center border-b border-gray-600 py-2 '>
                <span className='font-bold text-black rounded-full items-center justify-center flex text-xl '>
                    Testar Instrução
                </span>
                <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs '>
                    Teste a instrução do seu assistente
                </span>
            </div>
            <div id='conteiner-msg' className='w-full h-[30rem] p-2 bg-transparent shadow-sm shadow-[--azul] rounded-md overflow-x-auto ' >
                {
                    msgUpdate?.map((i: any, index: number) => {
                        return (
                            <>
                                <Card origem={i.role} msg={i.msg} key={index} imgUser={imgUser || null} imgAssistente={imgAssistente} />
                            </>
                        )
                    })
                }
            </div>
            {
                status === 'authenticated' && assistente?.assistenteIdGPT &&
                <div className='w-full h-10 flex items-center justify-center gap-5'>
                    <input type='text' className='w-full p-1 bg-transparent border border-[--azul] h-full shadow-sm shadow-[--azul] rounded-md resize-none ' placeholder='Digite ou cole o texto que deseja treinar seu assistente' {...register('msgUser')} />
                    <button className='p-2 bg-[--azul] text-white rounded-md' onClick={() => sendMsg()} >
                        <IconSend size={25} strokeWidth={1.5} color={'#fff'} />
                    </button>
                </div>
            }
        </>
    );
}


const Card = ({origem, msg, imgUser, imgAssistente , key} : {origem?: "user" | "assistente", msg:string , imgUser?: string | null, imgAssistente: string, key: number}) => {
    return (
        <div className={`w-full h-auto items-start justify-start mb-5 border-gray-600 gap-5 p-2  ${origem === 'user' ? ' flex flex-row-reverse ' : 'flex' } `} key={key}>
            {
                origem === 'user' ? 
                    !imgUser ?
                        <IconUser size={30} strokeWidth={1.5} color={'#000'} className=' rounded-full border border-black p-1 ' />
                    :
                        <Image src={imgUser} width={30} height={30} alt={''} className=' rounded-full ' />
                :
                <Image src={imgAssistente} width={30} height={30} alt={''} className=' rounded-full ' />
            }
            
            <span className='font-extralight text-black items-start justify-start flex text-sm w-full h-auto resize-none overflow-hidden bg-slate-200 rounded-xl p-3 '>
                {msg}
            </span>
        </div>
    )
}