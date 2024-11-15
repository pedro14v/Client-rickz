'use client'
import * as React from 'react';
import { IconCoins, IconLogout, IconUserCircle, IconUsersGroup } from '@tabler/icons-react';
import { usePathname , useRouter } from 'next/navigation';
import { createAssistente } from '@/functions/assistentes/createAssistente';
import { useSession } from "next-auth/react"
import { signOut } from 'next-auth/react';
import { deleteCookies } from '@/functions/deleteCookies';

import Image from 'next/image';
import { Button } from './Button';
export interface IHeaderProps {
}

export default function Header (props: IHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session , status, update } = useSession() as any;
    console.log('session:', session)
    const [menuProfile, setMenuProfile] = React.useState(false) as any;
    const [loadingNovoAssistente, setLoadingNovoAssistente] = React.useState({status: 'none', message: ''}) as any;

    const newAssistente = async () => {
        setLoadingNovoAssistente({status: 'loading', message: 'Criando...'});
        const id = await createAssistente({nome: `${session.user.Assistente.length + 1}`, userId: session.user.id, token: session.user.token});

        await update();
        router.push(`/assistente/${id}/configuracao`);
        setLoadingNovoAssistente({status: 'success', message: 'Criado com sucesso!'});
        setTimeout(() => {
            setLoadingNovoAssistente({status: 'none', message: ''});
        }, 3000);
    }



    return (
        <>

            <header className='flex flex-col justify-between items-start w-full h-28 bg-[--bg-start] text-white shadow shadow-black z-[999] fixed top-0 '>
                <span className='text-xl font-bold w-full text-center  bg-gray-800'>WhatsApp Clone</span>
                <div className='flex items-center justify-between w-full h-full px-10 max-w-screen-2xl m-auto '>
                    <div className='flex items-center justify-center gap-2 h-full z-10 w-auto '>
                        {/* <Image src={'/logo.png'} width={150} height={150} alt='Logo'  /> */}
                        <div className='flex flex-col items-center justify-center gap-1 h-full z-10 w-auto '>
                            {
                                session?.user?.role === 'SUPER_ADMIN' &&
                                <button className='px-2 rounded-md bg-blue-500 text-white w-40 shadow shadow-gray-200 ' onClick={() => router.push('/admin')}>
                                    Administração
                                </button>
                            }
                            <button className='px-2 rounded-md bg-blue-500 text-white w-40 shadow shadow-gray-200' onClick={() => router.push('/')}>
                                Meus assistentes
                            </button>
                        </div>
                    </div>
                    <div className='flex items-center justify-between gap-2 h-full py-4 z-10 w-auto '>
                        <span className='text-md font-bold w-40 text-center flex items-center gap-2 text-black'>
                            <IconCoins size={24} stroke={2} className=''/>
                            Créditos: {session?.user?.Creditos ? session?.user?.Creditos[0]?.creditos : 0}
                        </span>
                        {
                            session?.user?.role !== 'ATENDENTE' &&
                            <Button text='Novo assistente' functionGet={newAssistente} msgUpdate={loadingNovoAssistente} disabled={false} msgAction={false} />
                        }
                        <hr className='w-[1px] bg-black h-4/5 '/>
                        <div className='relative flex items-center justify-between gap-2 h-full ml-5 z-10 w-auto '>
                            <Image src={session?.user?.image || '/perfil-img-default/default.png'} width={40} height={40} alt='Foto de perfil' className='rounded-full cursor-pointer ' onClick={() => setMenuProfile(!menuProfile)} />
                            <div className={`absolute top-14 right-0 w-40 overflow-hidden bg-gray-600 shadow-md shadow-black rounded-md transition-default cursor-pointer ${menuProfile ? 'h-24 p-2' : 'h-0'}`}>
                                {
                                    session?.user?.role === 'ADMIN' &&
                                    <button className='w-full p-2 text-white rounded-md flex justify-center px-5 ' onClick={() => { router.push('/membros') ; setMenuProfile(false) } }>
                                        <IconUsersGroup size={24} stroke={2} className='mr-2'/>
                                        Membros
                                    </button>
                                }
                                
                                <button className='w-full p-2 text-white rounded-md flex justify-center px-6 ' onClick={() => { signOut(); deleteCookies ; setMenuProfile(false) } }>
                                    <IconLogout size={24} stroke={2} className='mr-2'/>
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            
            </header>
            
        
        </>
    );
}
