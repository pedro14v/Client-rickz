'use client'
import React, { useState , useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, SubmitHandler } from "react-hook-form"
import { IconCategory2, IconCircleDashedCheck, IconCirclePlus, IconEdit, IconSquareRoundedX } from '@tabler/icons-react';
import { ativarCombo, deleteCombo } from '@/functions/assistentes/combos/combo';

export default function PerfilAssistente ({params}: Readonly<{params: {id: string}}>) {
    const { register, handleSubmit, watch, formState: { errors } , setValue  } = useForm();
    const { data: session , update } = useSession() as any
    const router = useRouter();
    const assistente = session?.user?.Assistente?.filter((assistente:any) => assistente.id === params.id)[0]
    const combos = session?.user?.Combos
    const comboAtivo = combos?.filter((combo:any) => combo.id === assistente?.comboId)[0]
    const [isActiveButtonCriarCombo, setIsActiveButtonCriarCombo] = useState(!combos || combos?.length <= 5 ? true : false)
    const [menuActions, setMenuActions] = useState<string>('')	
    const [excluindoCombo, setExcluindoCombo] = useState<string>('')
    const[ actionActiveInMoment, setActionActiveInMoment ] = useState<boolean>(false)
    
    const excluirCombo = async (comboID: string) => {
        setActionActiveInMoment(true)
        setExcluindoCombo(comboID)
        const excluir = await deleteCombo(comboID)
        if(excluir.status === 'success') {
            window.location.reload()
        }
    }

    const ativarComboNoAssistente = async (comboID: string) => {
        setActionActiveInMoment(true)
        const ativar = await ativarCombo(comboID, params?.id)
        console.log(ativar)
        if(ativar.status === 'success') {
            await update({
                user : {
                    ...session.user,
                    Assistente: session.user.Assistente.map((assistente:any) => {
                        if(assistente.id === params.id) {
                            assistente.comboId = comboID
                        }
                        return assistente
                    })
                }
            }).then((i:any) => {
                console.log(i)
                window.location.reload()
            }).catch((err:any) => {
                console.log(err)
            })
        }
        setActionActiveInMoment(false)

    }


    return (
        <>
            <div className='w-full flex flex-col h-auto  items-start justify-center border-b border-gray-600 py-2 '>
                <span className='font-bold text-black rounded-full items-center justify-center flex text-xl '>
                    Combo ativo do assistente
                </span>
                <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs '>
                    Ative ou desative o combo do seu assistente.
                </span>
            </div>
            <div className='w-full flex h-auto items-center justify-between shadow-sm shadow-gray-500 rounded-md py-2 px-5 gap-1 '>
                {
                    !comboAtivo ?
                    <>
                        <span className='text-black rounded-full items-center justify-center flex text-sm '>
                            Nenhum combo ativo
                        </span>
                    </>
                    :
                    <>
                        <table className='w-full h-auto text-black rounded-full text-sm '>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome do combo</th>
                                    <th>Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={`relative text-black`}>
                                    <td className='text-center'>
                                        {comboAtivo.id}
                                    </td>
                                    <td className='text-center truncate max-w-40'>
                                        {comboAtivo.nome}
                                    </td>
                                    <td className='text-center truncate max-w-40'>
                                        {comboAtivo.descricao}
                                    </td>
                                    <td className='flex items-center justify-center relative'>
                                        <button 
                                            className={`cursor-pointer flex-col flex items-center justify-center  font-bold w-auto rounded-lg h-10 text-black transition-default ${menuActions === comboAtivo.id ? 'rotate-45 scale-125 ' : 'rotate-0 scale-100 '  } ${actionActiveInMoment && 'text-gray-400 opacity-40'}  `} 
                                            disabled={actionActiveInMoment} 
                                            onBlur={() => setMenuActions('') } 
                                            onClick={() => setMenuActions(menuActions === comboAtivo.id ? '' : comboAtivo.id)}
                                        >
                                            <IconCategory2 size={25} />
                                        </button>
                                        <div className={`rounded-lg  flex flex-col items-center justify-center gap-1 z-50 absolute bg-slate-700 shadow-xl shadow-black  overflow-hidden transition-default  ${menuActions === comboAtivo.id ? 'w-80 h-32 -top-32 right-0 px-5 ' : 'w-0 h-0 top-6 right-6'    }   `}>
                                            <button className={`p-1  rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden hover:scale-105 ${assistente?.comboId === comboAtivo.id ? 'text-green-500' : 'text-white'} ${menuActions === comboAtivo.id ? 'w-full' : 'w-0' } `} disabled={assistente?.comboId === comboAtivo.id} onClick={() => ativarComboNoAssistente(comboAtivo.id)}>
                                                <IconCircleDashedCheck size={25} strokeWidth={1.5} className='size-6 ' />
                                                {
                                                    assistente?.comboId === comboAtivo.id ? 'Combo ativo nesse assistente' : 'Ativar nesse assistente'
                                                }
                                            </button>
                                            <button 
                                                className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer  overflow-hidden hover:scale-105 ${menuActions === comboAtivo.id ? 'w-full' : 'w-0' } `}
                                                onClick={() => router.push(`/assistente/${params.id}/produtos/${comboAtivo.id}/criar-produtos`)}
                                            >
                                                <IconCirclePlus size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                                Adicionar novos produtos
                                            </button>
                                            <button className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden hover:scale-105 ${menuActions === comboAtivo.id ? 'w-full' : 'w-0' } `} disabled={excluindoCombo === comboAtivo.id} onClick={() => excluirCombo(comboAtivo.id)}>
                                                <IconSquareRoundedX size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                                Excluir combo
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>


                       
                    </>
                }
            </div>
            <div className='w-full flex h-auto  items-start justify-between border-b border-gray-600 py-2 '>
                <span className='font-bold text-black rounded-full items-center justify-center flex text-xl '>
                    Combos disponíveis
                </span>
                <button 
                    className={`cursor-pointer flex-col flex items-center justify-center  font-bold w-60 rounded-lg h-10 ${!isActiveButtonCriarCombo ? 'bg-gray-300 text-gray-400 ' : 'bg-[--roxo] text-white'} `} 
                    disabled={!isActiveButtonCriarCombo} 
                    onClick={() => router.push(`/assistente/${params.id}/produtos/criar-combos`)}>
                    Criar combo
                </button>
            </div>
            <div className='w-full flex flex-col h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md py-2 px-5 gap-1 '>
                {
                    !combos || combos?.length === 0 ?
                    <>
                        <span className='text-black rounded-full items-center justify-center flex text-sm '>
                            Nenhum combo disponível
                        </span>
                    </>
                    :
                    <>
                        <table className='w-full h-auto text-black rounded-full text-sm '>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome do combo</th>
                                    <th>Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    combos.map((combo:any, index:any) => {
                                        console.log(combo)
                                        return (
                                            <tr key={combo.id} className={`relative ${assistente?.comboId === combo.id ? 'border-green-600 border text-black' : 'bg-white text-black'}`}>
                                                <td className='text-center'>
                                                    {combo.id}
                                                </td>
                                                <td className='text-center truncate max-w-40'>
                                                    {combo.nome}
                                                </td>
                                                <td className='text-center truncate max-w-40'>
                                                    {combo.descricao}
                                                </td>
                                                <td className='flex items-center justify-center relative'>
                                                    <button 
                                                        className={`cursor-pointer flex-col flex items-center justify-center  font-bold w-auto rounded-lg h-10 text-black transition-default ${menuActions === index ? 'rotate-45 scale-125 ' : 'rotate-0 scale-100 '  } ${actionActiveInMoment && 'text-gray-400 opacity-40 animate-pulse '}  `} 
                                                        disabled={actionActiveInMoment} 
                                                        onBlur={() => setMenuActions('') } 
                                                        onClick={() => setMenuActions(menuActions === index ? '' : index)}
                                                    >
                                                        <IconCategory2 size={25} />
                                                    </button>
                                                    <div className={`rounded-lg  flex flex-col items-center justify-center gap-1 z-50 absolute bg-slate-700 shadow-xl shadow-black  overflow-hidden transition-default  ${menuActions === index ? 'w-80 h-32 -top-32 right-0 px-5 ' : 'w-0 h-0 top-6 right-6'    }   `}>
                                                        <button className={`p-1  rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden hover:scale-105 ${assistente?.comboId === combo.id ? 'text-green-500' : 'text-white'} ${menuActions === index ? 'w-full' : 'w-0' } `} disabled={assistente?.comboId === combo.id} onClick={() => ativarComboNoAssistente(combo.id)}>
                                                            <IconCircleDashedCheck size={25} strokeWidth={1.5} className='size-6 ' />
                                                            {
                                                                assistente?.comboId === combo.id ? 'Combo ativo nesse assistente' : 'Ativar nesse assistente'
                                                            }
                                                        </button>
                                                        <button 
                                                            className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer  overflow-hidden hover:scale-105 ${menuActions === index ? 'w-full' : 'w-0' } `}
                                                            onClick={() => router.push(`/assistente/${params.id}/produtos/${combo.id}/criar-produtos`)}
                                                        >
                                                            <IconCirclePlus size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                                            Adicionar novos produtos
                                                        </button>
                                                        <button className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden hover:scale-105 ${menuActions === index ? 'w-full' : 'w-0' } `} disabled={excluindoCombo === combo.id} onClick={() => excluirCombo(combo.id)}>
                                                            <IconSquareRoundedX size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                                            Excluir combo
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>


                       
                    </>
                }
            </div>
            
    
        </>
    )
}