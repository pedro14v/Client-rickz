'use client'
import React, { useState , useEffect, use} from 'react';
import { useSession } from "next-auth/react"
import { getAllUsers } from '@/functions/admin/getAllUsers';
import { useForm, SubmitHandler, set } from "react-hook-form"
import { useRouter } from 'next/navigation';
import Popup from '@/components/admin/Popup';
import { deleteUser } from '@/functions/admin/deleteUser';
export interface IAdminProps {
}

export default function Admin(props: IAdminProps){
    const router = useRouter();
    const { register, watch, formState: { errors } } = useForm();
    const { data: session , status } = useSession() as any;
    const [qtd, setQtd] = useState(10) as any;
    const [users, setUsers] = useState([]) as any;
    const [search, setSearch] = useState('') as any;
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
                const users = await getAllUsers({email: session.user.email,qtd: qtd}) as any;
                console.log(users)
                setUsers(users?.sort((a: any, b: any) => a.createdAt - b.createdAt))
            })()
        }
    }, [session])

    const buscar = async () => {
        setSearch(watch('search'));
    }

    const excluir = async ({id} : {id?: string}) => {
        const deletarUser = await deleteUser({idAdmin: session.user.email, idUser: id as string }) as any;
        console.log(deletarUser)
        if(deletarUser.status === 'success'){
            return window.location.reload();
        }

        setPopup({status: false, title: '', description: '', functionReturn: () => console.log('functionReturn')})
    }



    return (
        <section className='flex flex-col items-center justify-start w-full min-h-screen gap-5 m-auto max-w-screen-2xl pt-40 '>
            <h1 className='text-2xl w-full text-start font-bold text-black border-b-2 border-black '>Administração</h1>
            <div className='w-full flex items-center justify-start gap-5  '>
                <input type="text" placeholder='Pesquisar usuario por E-mail' className='p-2 w-full shadow shadow-gray-600 rounded-md ' {...register('search')}/>
                <button className='p-1 bg-blue-600 text-white rounded-md shadow shadow-gray-600 w-60 ' onClick={buscar}>
                    Buscar
                </button>
            </div>

            <table className='w-full border border-gray-200 text-sm '>
                <thead>
                    <tr>
                        <th className='border p-2'>Nome</th>
                        <th className='border p-2'>Email</th>
                        <th className='border p-2'>Assistentes</th>
                        <th className='border p-2'>Créditos</th>
                        <th className='border p-2'>Data de criação</th>
                        <th className='border p-2'>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users && search === '' ?
                        users.slice(0, qtd).map((i: any, index: number) => {
                            return (
                                <tr key={index}>
                                    <td className='border p-2 text-center'>{i.name}</td>
                                    <td className='border p-2 text-center'>{i.email}</td>
                                    <td className='border p-2 text-center'>{i.Assistente.length}</td>
                                    <td className='border p-2 text-center'>{i.Creditos[0].creditos}</td>
                                    <td className='border p-2 text-center'>{new Date(i.createdAt).toLocaleDateString('pt-BR', {timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'})}</td>
                                    <td className='border text-center'>
                                        <button className='p-1 bg-blue-600 text-white rounded-md shadow shadow-gray-600 w-20 ' onClick={() => { router.push(`/admin/${i.id}/editar`)}}>
                                            Editar
                                        </button>
                                        <button className='p-1 bg-red-600 text-white rounded-md shadow shadow-gray-600 w-20 m-2' onClick={() => setPopup({
                                            status: true,
                                            title: 'Excluir usuario',
                                            description: 'Deseja realmente excluir o usuario ?',
                                            functionReturn: () => excluir({id: i.id}),
                                            button: 'Excluir'
                                        })}>
                                            Excluir
                                        </button>
                                        
                                    </td>
                                </tr>
                            )
                        }) 
                        :
                        search ?
                        users.filter((i: any) => i.email.includes(search)).map((i: any, index: number) => {
                            return (
                                <tr key={index}>
                                    <td className='border p-2 text-center'>{i.name}</td>
                                    <td className='border p-2 text-center'>{i.email}</td>
                                    <td className='border p-2 text-center'>{i.Assistente.length}</td>
                                    <td className='border p-2 text-center'>{i.Creditos[0].creditos}</td>
                                    <td className='border p-2 text-center'>{new Date(i.createdAt).toLocaleDateString('pt-BR', {timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'})}</td>
                                    <td className='border text-center'>
                                        <button className='p-1 bg-blue-600 text-white rounded-md shadow shadow-gray-600 w-20 ' onClick={() => { router.push(`/admin/${i.id}/editar`)}}>
                                            Editar
                                        </button>
                                        <button className='p-1 bg-red-600 text-white rounded-md shadow shadow-gray-600 w-20 m-2' onClick={() => setPopup({
                                            status: true,
                                            title: 'Excluir usuario',
                                            description: 'Deseja realmente excluir o usuario ?',
                                            functionReturn: () => excluir({id: i.id}),
                                            button: 'Excluir'
                                        })}>
                                            Excluir
                                        </button>
                                        
                                    </td>
                                </tr>
                            )
                        }):
                        <tr>
                            <td className='border p-2 text-center' colSpan={6}>Nenhum usuário encontrado</td>
                        </tr>

                    }
                </tbody>
            </table>
            {
                users.length > qtd && search === '' &&
                <>
                    {
                        qtd > 10 &&
                        <button className='p-1 bg-blue-600 text-white rounded-md shadow shadow-gray-600 w-60 ' onClick={() => setQtd(qtd - 10)}>
                            Ver menos
                        </button>
                    }
                    <button className='p-1 bg-blue-600 text-white rounded-md shadow shadow-gray-600 w-60 ' onClick={() => setQtd(qtd + 10)}>
                        Ver mais
                    </button>

                
                </>

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
    );
}
