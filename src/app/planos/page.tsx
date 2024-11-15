'use client'
import { IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export interface IAppProps {
}

export default function Planos (props: IAppProps) {
    const router = useRouter();
    return (
        <section className='flex flex-col items-center justify-start w-full min-h-screen gap-5 m-auto max-w-screen-2xl pt-40 '>
            <h6 className="text-3xl font-bold " id='Plans'>
                        Escolha o seu plano:
                    </h6>
                    <div className="w-full h-auto flex flex-col justify-start items-center gap-5 "  >
                        <div className="lg:container mx-auto text-center">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className=" text-black lg:p-4 p-1 rounded-lg shadow-lg shadow-[--roxo] h-72 flex flex-col items-center justify-center ">
                                    <h3 className="text-lg font-bold">SEMESTRAL</h3>
                                    <p className="mt-2"><b className=' text-xl '>R$149,90/mês</b> + Frete</p>
                                    <span className="mt-2 flex items-center justify-center gap-2">
                                        <IconCheck size={20} className='text-[--roxo]' />
                                        <p className='text-sm '>Ganhe acesso a comunidade</p>
                                    </span>
                                    <span className="mt-2 flex items-center justify-center gap-2">
                                        <IconCheck size={20} className='text-[--roxo] lg:text-xl text-sm ' />
                                        <p className='text-center text-sm ' >Possibilidade de ganhar R$ 700,00 em prêmios</p>
                                    </span>
                                    <button className="mt-10 bg-[--roxo] text-white py-2 px-4 rounded-lg w-4/5 " onClick={() => router.push('/semestral/personalizacao/1')}>
                                        Assinar
                                    </button>
                                </div>
                                <div className="relative bg-[--roxo] text-white lg:p-4 p-1 rounded-lg shadow-lg shadow-[--amarelo] h-72 flex flex-col items-center justify-center ">
                                    <h3 className="text-lg font-bold">ANUAL</h3>
                                    <p className="mt-2"><b className=' text-xl '>R$139,90/mês</b> + Frete</p>
                                    <span className="mt-2 flex items-center justify-center gap-2">
                                        <IconCheck size={20} className='text-[--amarelo]' />
                                        <p className='text-sm '>Ganhe acesso a comunidade</p>
                                    </span>
                                    <span className="mt-2 flex items-center justify-center gap-2">
                                        <IconCheck size={20} className='text-[--amarelo] lg:text-xl text-sm ' />
                                        <p className='text-center text-sm ' >Possibilidade de ganhar R$ 700,00 em prêmios</p>
                                    </span>
                                    <button className="mt-10 bg-white text-black py-2 px-4 rounded-lg w-4/5 " onClick={() => router.push('/anual/personalizacao/1')}>
                                        Assinar
                                    </button>
                                    <span className="absolute top-2 -right-3 bg-green-500 text-black py-1 px-2 rounded-lg animate-pulse">
                                        Mais assinado
                                    </span>
                                </div>
                                <div className=" text-black lg:p-4 p-1 rounded-lg shadow-lg shadow-[--roxo] h-72 flex flex-col items-center justify-center ">
                                    <h3 className="text-lg font-bold">MENSAL</h3>
                                    <p className="mt-2"><b className=' text-xl '>R$159,90/mês</b> + Frete</p>
                                    <span className="mt-2 flex items-center justify-center gap-2">
                                        <IconCheck size={20} className='text-[--roxo]' />
                                        <p className='text-sm '>Ganhe acesso a comunidade</p>
                                    </span>
                                    <span className="mt-2 flex items-center justify-center gap-2">
                                        <IconX size={20} className='text-[--roxo] lg:text-xl text-sm ' />
                                        <p className='text-center text-sm ' >Possibilidade de ganhar R$ 700,00 em prêmios</p>
                                    </span>
                                    <button className="mt-10 bg-[--roxo] text-white py-2 px-4 rounded-lg w-4/5 " onClick={() => router.push('/mensal/personalizacao/1')}>
                                        Assinar
                                    </button>
                                </div>
                                
                            </div>
                        </div>
                        
                    </div>
        
        </section>
    );
}
