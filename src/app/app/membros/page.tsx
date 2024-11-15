'use client'
import { IconCirclePlus, IconLineDotted } from '@tabler/icons-react';
import React , { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react"
import { Titles } from '@/components/Titles';
import { getAllMembers } from '@/functions/membros/getAllMembers';
import { Button } from '@/components/Button';
import Select from 'react-select';
import { useForm } from 'react-hook-form';
import { createMember } from '@/functions/membros/createMember';
import z, { set } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { deleteMember } from '@/functions/membros/deleteMember';

const schema = z.object({
  email: z.string().email(),
  role: z.string(),
  permissions: z.object({
    assistentes: z.string(),
    treinamento: z.boolean()
  })
})

export default function Home() {
  const router = useRouter();
  const { register, handleSubmit, setValue,watch, formState: { errors } } = useForm({resolver: zodResolver(schema)});
  const { data: session , status , update } = useSession() as any;
  const [secNewMember, setSecNewMember] = useState(false) as any;
  const [membros, setMembros] = useState([]) as any;
  const [optionsAssistant, setOptionsAssistant] = useState([]) as any;
  const [ loading, setLoading ] = useState<{status: string, message: string}>({status: 'none', message: ''});
  const [ deleteLoading, setDeleteLoading ] = useState<{status: string, message: string, id:string}>({status: 'none', message: '', id: ''});
  console.log(errors)
  useEffect(() => {
    if(!session) return
    const getMembers = async () => {
      const member = await getAllMembers({userId: session.user.id});
      console.log(member)
      setMembros([...member]);
    }

    getMembers();
    setOptionsAssistant([
      { value: 'ALL', label: 'Todos assistentes' },
      ...session?.user?.Assistente.map((assistant: any) => ({
        value: assistant.id,
        label: <strong>{assistant.nome}</strong>
      }))
    ])
  }, [session])
  

  const options = [
    {
      value: 'ADMIN',
      label: (
        <div className='flex flex-col'>
          <strong>ADMIN</strong>
          <span className='text-xs text-gray-500'>Acesso total ao sistema</span>
        </div>
      ),
    },
    {
      value: 'GERENTE',
      label: (
        <div className='flex flex-col'>
          <strong>GERENTE</strong>
          <span className='text-xs text-gray-500'>
            Acesso total ao sistema menos a parte de membros
          </span>
        </div>
      ),
    },
    {
      value: 'ATENDENTE',
      label: (
        <div className='flex flex-col'>
          <strong>ATENDENTE</strong>
          <span className='text-xs text-gray-500'>
            Acesso limitado, apenas para atendimento
          </span>
        </div>
      ),
    },
  ];


  const onSubmit = async (data: any) => {
    console.log(data)
    setLoading({status: 'loading', message: 'Criando...'})
    const member = await createMember({userId: session.user.id, token: session.user.token, email: data.email, role: data.role, permissions: data.permissions});


    if(member.status === 'success') {
      setLoading({status: 'success', message: 'Membro criado com sucesso'})
      setSecNewMember(false)
      update();
    } else {
      setLoading({status: 'error', message: 'Erro ao criar membro'})
    }


    setTimeout(() => {
      setLoading({status: 'none', message: ''})
    }, 3000)
  }

  const excluirMembro = async (id: string) => {
    setDeleteLoading({status: 'loading', message: 'Deletando...', id})
    const member = await deleteMember({id});
    if(member.status === 'success') {
      setDeleteLoading({status: 'success', message: 'Membro deletado com sucesso', id})
      update();
    } else {
      setDeleteLoading({status: 'error', message: 'Erro ao deletar membro', id})
    }


    setTimeout(() => {
      setDeleteLoading({status: 'none', message: '', id: ''})
    }, 3000)
  }
  

  console.log(watch('role'))
  return (
    <main className="flex min-h-screen flex-col items-center justify-start h-screen pt-40  ">
      <section className=" max-w-screen-2xl w-full min-h-screen flex flex-col items-center justify-start gap-5" >
        <Titles title='Membros' subtitle='Lista de membros cadastrados' />
        {
          membros.length > 0 ?
          <div className='flex flex-col items-center justify-center gap-2 w-1/2 h-auto border-gray-500 border rounded-md shadow shadow-gray-200 py-5'>
            <div className='flex shadow-sm shadow-black items-center justify-between gap-2 w-full h-10 text-white rounded-md border-b border-black py-10 px-5 '>
              <span className='text-sm font-bold text-black flex px-5 w-auto justify-between '>
                TOKEN MEMBER: <b>{session.user.token}</b>
              </span>
              <button className='flex items-center justify-center gap-2 w-40 h-10 bg-blue-500 text-white rounded-md shadow shadow-gray-200' onClick={() => {setSecNewMember(!secNewMember);setValue('role', 'ATENDENTE')}}>
                <IconCirclePlus size={24} stroke={2} />
                <span>Novo membro</span>
              </button>
            </div>
            {
              secNewMember &&
              <div className='flex items-center justify-center gap-2 rounded-xl shadow shadow-gray-200 fixed w-screen h-screen z-[999999] top-0 backdrop-blur '>
                <span className='absolute bg-gray-500 w-full h-full opacity-90 -z-50  ' onClick={() => setSecNewMember(false)}></span>
                <form onSubmit={handleSubmit(onSubmit)}
                  className='flex flex-col items-center justify-between gap-2 w-1/2 h-auto p-5 border border-gray-500 rounded-md shadow shadow-gray-200'>
                  <input type='email' placeholder='Email do membro' className='w-3/5 h-10 px-2 font-semibold border border-gray-500 rounded-md shadow shadow-gray-200' {...register('email')} />
                  <Select
                    options={options}
                    className="text-sm w-3/5"
                    placeholder="Selecione um cargo"
                    onChange={(e:any) => setValue('role', e.value)}
                    defaultValue={options[2]}
                  />
                  <input type='text' className='hidden' {...register('role')} />
                  {
                    watch('role') === 'ATENDENTE' &&
                    <>
                      <Select
                        options={optionsAssistant}
                        className="text-sm w-3/5"
                        placeholder="Selecione um assistente"
                        onChange={(e: any) => setValue('permissions.assistentes', e.value)} // Atualiza o valor do campo "whatsapp"
                        defaultValue={{ value: 'ALL', label: 'Todos assistentes' }} // Define o valor padrão
                      />
                      <input type='text' className='hidden'  {...register('permissions.assistentes')} defaultValue={'ALL'} />
                      <div className='flex items-center gap-2 w-3/5 h-10 bg-white justify-between px-2 rounded-md'>
                        <span className='text-sm font-bold'>Alterar treinamento</span>
                        <label
                          className="relative inline-block h-7 w-[48px] cursor-pointer rounded-full bg-gray-900 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-[#1976D2]"
                        >
                          <input type="checkbox" id="AcceptConditions" className="peer sr-only" {...register('permissions.treinamento')} />
                          <span
                            className="absolute inset-y-0 start-0 m-1 size-5 rounded-full ring-[5px] ring-inset ring-white transition-all peer-checked:start-7 bg-gray-900 peer-checked:w-2 peer-checked:bg-white peer-checked:ring-transparent"
                          ></span>
                        </label>
                      </div>
                   
                    </>
                  }
                  <Button text={loading?.message || 'Adicionar'} msgUpdate={loading} disabled={false} functionGet={() => {}} />
                </form>
              </div>
            }
            {
              membros.map((membro : any) => (
                console.log(membro),
                <div key={membro.id} className='flex text-black items-center justify-between bg-white rounded-xl w-full p-5 h-10 shadow shadow-gray-200'>
                  <span className='text-md font-bold'>{membro.userEmail}</span>
                  <span className='text-md font-bold'>{membro.role}</span>
                  {
                    session?.user?.role === 'ADMIN' &&
                    <Button text={deleteLoading?.id === membro?.id && deleteLoading?.message || 'Excluir'} 
                      msgUpdate={deleteLoading?.id === membro?.id ? deleteLoading : {status: 'none', message: ''}}
                      disabled={false} functionGet={() => excluirMembro(membro.id)} 
                    />
                  }
                </div>
              ))
            }
          </div>
          :
          <div className='flex items-center justify-center gap-2 w-full h-40 bg-white rounded-md shadow shadow-gray-200'>
            <span className='text-md font-bold text-black'>Nenhum membro cadastrado</span>
          </div>
        }
      </section>
    </main>
  );
}
