'use client'
import Link from 'next/link';
import * as React from 'react';
import { useForm, SubmitHandler } from "react-hook-form"
import Image from 'next/image'; 
import { IconShoppingCart, IconUser } from '@tabler/icons-react';
import { useParams } from 'next/navigation'
import { Button } from './Button';
import { deleteAssistente } from '@/functions/assistentes/deleteAssistente';
import { useSession } from 'next-auth/react';


export default function Assistente ({children, select }: Readonly<{children: React.ReactNode , select: string }>) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { data: session , status , update } = useSession() as any;
    console.log('session:', session)
    const params = useParams<{ id: string}>()
    const [loadingExcluir, setLoadingExcluir] = React.useState({status: 'none', message: ''}) as any;
    console.log(select)
    var urlBase = `/assistente/${params.id}/`


    const excluirBot = async ({ id }: { id:string }) => {
        setLoadingExcluir({status: 'loading', message: 'Excluindo bot...'})
        await deleteAssistente({id: id})
        setTimeout(() => {
            setLoadingExcluir({status: 'success', message: 'Bot excluido com sucesso'})
            window.location.href = '/'
        }, 2000)
    }
    console.log(session?.user?.role !== 'ATENDENTE' || session?.user?.Member?.permissions?.treinamento)
    console.log(session?.user?.role)
    return (
        <section className=' relative flex items-start justify-start w-full h-auto m-auto max-w-screen-2xl pt-40 '>
            <aside className='flex flex-col items-center justify-start w-60 h-auto gap-10 text-black fixed z-40 '>
               
                <Card_aside title='DADOS' arrayLinks={[{link:urlBase+'/configuracao', nome: 'Configurações',select: select === 'configuracao' && true }]} />
                {
                    ( session?.user?.role !== 'ATENDENTE' || session?.user?.Member?.permissions?.treinamento ) &&
                    <Card_aside title='CONHECIMENTO' arrayLinks={[{link: urlBase+'/treinamento', nome: 'Treinamento', select: select === 'treinamento' && true }, {link:urlBase+'/', nome: 'Intenções', select: select === 'Intenções' && true } , {link:urlBase+'/testar-instrucao', nome: 'Testar Instrução', select: select === 'testar-instrucao' && true }]}  />
                }
                <Card_aside title='CONEXÕES' arrayLinks={[{link: urlBase+'/canais', nome: 'Canais', select: select === 'canais' && true }, {link:urlBase+'/widget', nome: 'Widget', select: select === 'Widget' && true }, {link:urlBase+'/', nome: 'Integrações', select: select === 'Integrações' && true }, {link:urlBase+'/perfil', nome: 'Webhooks', select: select === 'Webhooks' && true }]} />
                {
                    session?.user?.role !== 'ATENDENTE' &&
                    <Button text='Excluir bot' functionGet={() => excluirBot({id:params.id})} msgUpdate={loadingExcluir} disabled={false} msgAction={false} />
                }
            </aside>
            <div className='relative flex flex-col items-start justify-start w-full h-auto gap-10 pl-80 pb-20 '>
                {children}
            </div>
        
        </section>
    );
}


const Card_aside = ({title, arrayLinks } : {title: string, arrayLinks: Array<{link: string,  nome: string , select: boolean}>}) => {
    return (
        <>
            <div className='relative flex flex-col items-center justify-center w-full h-auto px-5 '>
                <span className={`text-base font-bold w-full text-start mb-2 uppercase`}>{title}</span>
                <ul className='w-full border-l-2 border-gray-600 pl-4 py-5  '>
                    {arrayLinks.map((i , index) => (
                        <li className={`relative text-sm mt-2 w-full px-5 ${i.select && 'text-gradient'}  `} key={index}>
                            <Link href={i.link}>
                                {i.nome}
                            </Link>
                            <span className={`${i.select ? 'shadow shadow-[--azul] rounded-r-lg rounded-l text-[--azul] w-full h-full  ' : 'w-0 h-0' } absolute top-0 left-0 transition-default `} />
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}