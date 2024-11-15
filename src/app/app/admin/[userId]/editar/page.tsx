'use client'
import React, { useState , useEffect, use} from 'react';
import { useSession } from "next-auth/react"
import { getUser } from '@/functions/admin/getUser';
import { useForm, SubmitHandler, set } from "react-hook-form"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loading } from '@/components/Loading';
import { updateUser } from '@/functions/admin/updateUser';
import { Button } from '@/components/Button';
import Popup from '@/components/admin/Popup';
import { deleteUser } from '@/functions/admin/deleteUser';


export interface IAdminProps {
    params: {
        userId: string
    }
}

export default function Admin({params : {userId}}: IAdminProps){
    const router = useRouter();
    const { register, watch, formState: { errors } } = useForm();
    const { data: session , status , update } = useSession() as any;
    const [user, setUser] = useState() as any;
    const [msgUpdate , setMsgUpdate] = useState({status: false, msg: ''}) as any;
    const [popup, setPopup] = useState({
        status: false,
        title: '',
        description: '',
        functionReturn: () => console.log('functionReturn'),
        button: ''
    }) as any;
    


    useEffect(() => {
        if(session && status === 'authenticated'){
            (async () => {
                const users = await getUser({idAdmin: session.user.email, idUser: userId}) as any;
                setUser(users)
            })()
        }
    }, [session])

    const attUser = async () => {
        setPopup({status: false, title: '', description: '', functionReturn: () => {}})
        const data = {
            nome: watch('name'),
            email: watch('email'),
            role: watch('role') || user.role,
            Creditos: watch('credit')
        }
        
        const att = await updateUser({idAdmin: session.user.email, idUser: userId, data});

        setMsgUpdate(att)

        setTimeout(() => {
            setMsgUpdate({status: false, msg: ''})
        }, 5000)
    }


    const excluir = async ({id} : {id?: string}) => {
        const deletarUser = await deleteUser({idAdmin: session.user.email, idUser: id || userId}) as any;
        console.log(deletarUser)
        if(deletarUser.status === 'success'){
            return router.push('/admin')
        }

        setPopup({status: false, title: '', description: '', functionReturn: () => console.log('functionReturn')})
    }

    console.log(session?.user?.role)
    return (
        <>
            {
                !user ?
                <section className='flex flex-col items-center justify-start w-full min-h-screen gap-5 m-auto max-w-screen-2xl pt-40 '>
                    <Loading />
                </section>
                :
                <section className='flex flex-col items-center justify-start w-full min-h-screen gap-5 m-auto max-w-screen-2xl pt-40 '>
                    <span className=' w-full flex justify-between text-start font-bold text-black border-b-2 border-black p-2 '>
                        <h1 className='text-2xl' >Editar usuario</h1>
                        <button 
                            onClick={() => setPopup({
                                status: true,
                                title: 'Excluir usuario',
                                description: 'Deseja realmente excluir o usuario ?',
                                functionReturn: excluir,
                                button: 'Excluir'
                            })}
                            className='text-black bg-red-500 text-md  px-1 rounded-md shadow shadow-gray-600 '>
                            Excluir
                        </button>
                    </span>

                    <div className='w-full flex items-center justify-start gap-5 h-96  '>
                        <div className='w-full flex flex-col items-center justify-center gap-5 s-full '>
                            <Image src={user.image} width={500} height={500} alt='' className='w-40 h-auto rounded-lg border border-black ' />
                            {
                                session?.user?.role === 'admin-master' &&
                                <div className='flex flex-wrap items-center justify-center gap-5 w-full  '>
                                    <select className='p-2 w-40 shadow shadow-gray-600 rounded-md ' {...register('role')}>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                        <option value="admin-master">Admin Master</option>
                                    </select>
                                </div>
                            }
                        </div>
                        <div className='w-full flex flex-col items-center justify-center shadow-md shadow-[--azul] p-10 rounded-lg'>
                            
                            <input type="text" defaultValue={user?.email} placeholder='E-mail' className='mb-5 p-2 w-full shadow shadow-gray-600 rounded-md ' {...register('email')}/>
                            
                            <input type="text" defaultValue={user?.name} placeholder='Nome' className='p-2 w-full shadow shadow-gray-600 rounded-md ' {...register('name')}/>
                            <span className='text-xs text-black font-bold w-full text-start mb-5'>{String(watch('name')).length}/20</span>
                            <input type="text" defaultValue={user.Creditos && user?.Creditos[0]?.creditos} placeholder='Créditos' className='mb-5 p-2 w-full shadow shadow-gray-600 rounded-md ' {...register('credit')}/>
                            {
                                String(watch('name')).length <= 20 &&
                                <Button 
                                    text='Atualizar'
                                    functionGet={() => setPopup({
                                        status: true,
                                        title: 'Atualizar usuario',
                                        description: 'Deseja realmente atualizar o usuario ?',
                                        functionReturn: attUser,
                                        button: 'Atualizar'
                                    })}
                                    msgUpdate={msgUpdate}
                                    disabled={false}
                                    msgAction={true}
                                />
                            }
                                
                        </div>
                    </div>
                    <span className='text-2xl w-full text-start font-bold text-black border-b-2 border-black '>
                        Lista de assistentes
                    </span>
                    {
                        user?.Assistente && user?.Assistente.length > 0 ?
                        <>
                            <table className='w-full border border-gray-200 text-sm '>
                                <thead>
                                    <tr>
                                        <th className='border p-2'>Nome</th>
                                        <th className='border p-2'>Status</th>
                                        <th className='border p-2'>Data de criação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        user?.Assistente?.map((i: any, index: number) => {
                                            return (
                                                <tr key={index}>
                                                    <td className='border p-2 text-center'>{i.nome}</td>
                                                    <td className='border p-2 text-center'>{i.status}</td>
                                                    <td className='border p-2 text-center'>{new Date(i.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </>
                        :
                        <span className='text-md text-red-500 font-bold '>
                            Nenhum assistente cadastrado
                        </span>
                    }
                    

                    <Popup 
                        title= {popup.title}
                        description={popup.description}
                        status={popup.status}
                        close={() => setPopup({status: false, title: '', description: '', functionReturn: () => console.log('functionReturn')})}
                        functionReturn={popup.functionReturn}
                        button={popup.button}
                    />

                </section>
            }
        </>
    );
}
