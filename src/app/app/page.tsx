'use client'
import { IconCirclePlus, IconLineDotted } from '@tabler/icons-react';
import React , { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAllAssistentes } from '@/functions/assistentes/getAllAssistentes';
import { createAssistente } from '@/functions/assistentes/createAssistente';
import { useSession } from "next-auth/react"
import { Titles } from '@/components/Titles';


export default function Home() {
  const router = useRouter();
  const { data: session , status , update } = useSession() as any;

  const [sectionActive, setSectionActive] = useState<"Ativos" | "Inativos" | "Todos">("Ativos");
  const [assistente, setAssistente] = useState<{status: string, nome: string, id: string , image: string}[] | null>(null);


  useEffect(() => {
    status === 'authenticated' &&
    (async () => {
      console.log('getAllAssistente userId: ', session?.user?.id)
      const response = session.user.Assistente || await getAllAssistentes({userId: session?.user?.id});
      console.log('response:', session)
      setAssistente(response.map((assistente:any) => ({
        ...assistente,
        status: assistente.status || '',
        image: assistente.image || ''
      })));
    } )()
  } , [status])
  
  const goAssistente = (id: string) => {
    router.push(`/assistente/${id}/configuracao`);
  }

  const newAssistente = async () => {
    const id = await createAssistente({nome: `${assistente ? assistente.length + 1 : 0}`, userId: session?.user?.id , token: session?.user?.token});
    router.push(`/assistente/${id}/configuracao`);
  }
  console.log('session:', session)
  return (
    <main className="flex min-h-screen flex-col items-center justify-start h-full pt-40  ">
      <section className=" max-w-screen-2xl w-full min-h-screen flex flex-col items-center justify-start gap-5" >
            {/* <button
              className={`p-2  text-white w-20 shadow shadow-gray-600 rounded-md ${
                sectionActive === "Ativos" ? "bg-blue-600" : "bg-gray-500"
              }`}
              onClick={() => setSectionActive("Ativos")}
            >
              Ativos
            </button>
            <button
              className={`p-2 text-white w-20 shadow shadow-gray-600 rounded-md ${
                sectionActive === "Inativos" ? "bg-blue-600" : "bg-gray-500"
              }`}
              onClick={() => setSectionActive("Inativos")}
            >
              Inativos
            </button>
            <button
              className={`p-2 text-white w-20 shadow shadow-gray-600 rounded-md ${
                sectionActive === "Todos" ? "bg-blue-600" : "bg-gray-500"
              }`}
              onClick={() => setSectionActive("Todos")}
            >
              Todos
            </button> */}

          <Titles title='Assistentes' subtitle='Lista de assistentes cadastrados' />

        {
          status !== 'authenticated' && !assistente && 
          <div className='relative text-black font-bold size-10 flex items-center justify-center m-auto rounded-full'>
            <span className='w-full rounded-full absolute border-gray-500 size-full border-x-2 animate-spin '></span>
          </div>
        }
        {

          assistente && assistente.length === 0 && status === 'authenticated' &&
          <div className='flex flex-col items-center w-full gap-5 '>
            <span className='text-black font-bold w-full text-center'>Nenhum assistente cadastrado</span>
            <button className='text-white bg-blue-500  rounded-full shadow-md bg-gradient' onClick={() => newAssistente()}>
              <IconCirclePlus stroke={2} className='size-8 ' />
            </button>
          </div> 
        }
        {
          assistente && assistente.length > 0 && status === 'authenticated' &&
          assistente.map((i : any, index : any) => {
            console.log('i:', i)
            return (
              <>
                <div className='w-full flex h-auto items-center justify-between shadow-sm shadow-gray-500 rounded-md p-1 cursor-pointer ' key={index} onClick={() => goAssistente(i.id)}>
                  {cards({status: i.status, nome: i.nome, id: i.id , img: i.image})}
                </div>
              </>
            );
          })
        }
      </section>
    </main>
  );
}


const cards = ({status,nome,id,img}: {status: string, nome: string, id: string , img?: string}) => {
  console.log('img:', img)
  return (
    <>
      <div className='w-auto flex h-auto  items-center justify-center py-2 gap-2 '>
        <Image width={100} height={100} alt='imagem perfil assistente' className='font-bold text-white size-14 rounded-full items-center justify-center flex bg-black border-2 border-black ' src={img || '/perfil-img-default/1.webp'} / >
        <span className='font-bold text-black rounded-full items-center justify-center flex '>
          {nome}
        </span>
      </div>
      <span className={`p-1 m-2 text-center rounded-md text-black font-semibold w-40 shadow-md  cursor-pointer ${status === 'Ativo' ? 'bg-green-500 shadow-sm shadow-green-500 ' : 'bg-red-500 shadow-sm shadow-red-500 ' } `} >
        {status}
      </span>
    </>
  );
}