'use client'
import React, { useState , useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm, SubmitHandler } from "react-hook-form"
import { useRouter } from 'next/navigation';
import { criarCombo } from '@/functions/assistentes/combos/combo';
import { IconRosetteDiscountCheck } from '@tabler/icons-react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';


export default function PerfilAssistente ({params}: Readonly<{params: {id: string}}>) {
    const { register, handleSubmit, watch, formState: { errors } , setValue } = useForm();
    const { data: session, update } = useSession() as any
    const router = useRouter();
    const [camposPersonalizados, setCamposPersonalizados] = useState<any[]>([])
    const [msgCampposPersonalizados, setMsgCamposPersonalizados] = useState<string>('')
    const isActiveButtonCriarCombo = !!watch('nomeEstoque') && camposPersonalizados.length > 2
    const [isLoading, setIsLoading] = useState<string>('false')
    const [importFileLoading, setImportFileLoading] = useState<any>(null)
    const [produtos, setProdutos] = useState<any[]>([])
    const [nomeArquivo, setNomeArquivo] = useState<string>('')
    const addNovoCampo = () => {
        setCamposPersonalizados([...camposPersonalizados, {
            nomeCampo: watch('nomeCampo'),
            tipoCampo: watch('tipoCampo'),
            obrigatorio: watch('obrigatorio')
        }])
        setMsgCamposPersonalizados('Campo adicionado com sucesso.')

        setValue('nomeCampo', '')
        setValue('tipoCampo', '')
        setValue('obrigatorio', '')

        setTimeout(() => {
            setMsgCamposPersonalizados('')
        }, 3000)
    }

    const removerCampo = (index: number) => {
        const campos = camposPersonalizados.filter((campo, i) => i !== index)
        setCamposPersonalizados(campos)
    }

    const onSubmit: SubmitHandler<any> = async (data) => {
        setIsLoading('true')

        const response = await criarCombo({
            nome: data.nomeEstoque,
            descricao: data.descricaoEstoque,
            campos: camposPersonalizados,
            userEmail: session.user.email,
            produtos: produtos
        }) as any

        setIsLoading(response.status)
            
        setTimeout(() => {


            if(response.status === 'success') {
                update(
                    {
                        ...session,
                        user: {
                            ...session.user,
                            Combos: [
                                ...session?.user?.Combos, 
                                {
                                    id: response.id,
                                    nome: data.nomeEstoque,
                                    descricao: data.descricaoEstoque,
                                    campos: camposPersonalizados,
                                    produtos: produtos
                                }
                            ]
                        }
                    }
                )
                return router.push(`/assistente/${params.id}/produtos/${response.id}/criar-produtos`)
            }
            setIsLoading('false')
        }, 3000)
    }

    useEffect(() => {
        const file = watch('fileExcel')
        const hasFile = file?.[0]?.size > 0 ? true : false;
        const newCampos = []
        let isMounted = true; // Flag para verificar se o componente está montado

        if (hasFile) {
            setImportFileLoading('true')
            const file = watch('fileExcel')[0];
            console.log(file)
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet) as any;
                console.log(jsonData)
                setImportFileLoading('campos')
                const campos = jsonData.map((item: any, index: number) => {
                    const campo = Object.keys(item)
                    const type = typeof item[campo[index]]
                    const length = item[campo[index]]?.length
                    if(!campo[index]) return ''

                    campo[index] = campo[index] === 'Valor' || campo[index] === 'valor' || campo[index] === 'Estoque' || campo[index] === 'estoque' || campo[index] === 'Quantidade' || campo[index] === 'quantidade' || campo[index] === 'qtd' || campo[index] === 'Qtd' ? 'nullll' : campo[index]

                    if(campo[index] !== 'nullll') {
                        return {
                            nomeCampo: campo[index],
                            tipoCampo: type === 'string' ? length > 50 ? 'textarea' : 'text' : type === 'number' ? 'number' : 'text',
                            obrigatorio: 'S'
                        }
                    }
                    return ''

                }).filter((item: any) => item !== '')

                setCamposPersonalizados([...camposPersonalizados, ...campos])

                setImportFileLoading('salvando')
                const produtos = jsonData.map((item: any) => {
                    const newId = uuidv4()
                    item.id = newId
                    item.defaultEstoque = item['Estoque'] || item['estoque'] || item['Quantidade'] || item['quantidade'] || item['qtd'] || item['Qtd']
                    item.defaultValor = item['Valor'] || item['valor']
                    delete item['Estoque'] || delete item['estoque']
                    delete item['Valor'] || delete item['valor']

                    return {    
                        id: newId,
                        JSON: JSON.stringify(item),
                    }
                })

                setProdutos(produtos)
                setNomeArquivo(file.name)
                setImportFileLoading('success')
            };
            reader.readAsBinaryString(file);
        }
        return () => {
            isMounted = false; // Cleanup quando o componente for desmontado
        };
    }, [watch('fileExcel')])


    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col h-auto items-center justify-center gap-5 '>
                <div className='w-full flex flex-col h-auto  items-start justify-center border-b border-gray-600 py-1 '>
                    <div className='font-bold text-black rounded-full items-center justify-between flex text-xl w-full '>
                        <span className='w-1/2' >Criar Combos</span>
                        <div className='w-full flex flex-row items-center justify-end gap-2 '>
                            {
                                isLoading === 'false' &&
                                <button onClick={() => {}} className={`cursor-pointer flex-col flex items-center justify-center  font-bold w-1/2 rounded-lg h-14 ${!isActiveButtonCriarCombo ? 'bg-gray-300 text-gray-400 ' : 'bg-[--roxo] text-white'} `} disabled={!isActiveButtonCriarCombo}>
                                    <span>Salvar combo</span>
                                    <span className='text-xs'>Crie ao menos 2 campos personalizados</span>
                                </button>
                            }
                            {
                                isLoading === 'true' &&
                                <div className={`cursor-pointer flex items-center justify-center  font-bold w-1/2 rounded-lg h-14 bg-yellow-600 text-black `}>
                                    <span className='animate-spin border-y-2 border-r-2 border-[--roxo] rounded-full size-10' />
                                    <span className='animate-pulse' >Salvando...</span>
                                </div> 
                            }
                            {
                                isLoading === 'error' &&
                                <div className={`cursor-pointer flex-col flex items-center justify-center  font-bold w-1/2 rounded-lg h-14 bg-red-500 text-white `}>
                                    <span>Erro ao salvar</span>
                                    <span className='text-xs'>Tente novamente</span>
                                </div>
                            }
                            {
                                isLoading === 'success' &&
                                <div className={`cursor-pointer flex items-center justify-center gap-2 font-bold w-1/2 rounded-lg h-14 bg-green-500 text-white `}>
                                    <IconRosetteDiscountCheck size={20} />
                                    <span>Salvo com sucesso</span>
                                </div>
                            }
                        </div>
                    </div>
                    <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs '>
                        Crie combos de produtos para que seu assistente possa vender ou auxiliar na venda.
                    </span>
                </div>
                <div className='w-full flex flex-col h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md py-2 px-5 gap-1 '>
                    <label className='text-base text-black text-start items-start justify-start flex w-full px-2 '>
                        Nome do combo de produtos *
                    </label>
                    <span className='text-xs text-gray-400 text-start items-start justify-start flex w-full px-2 '>
                        Pense que cada combo de produtos é uma loja assim, você pode criar um combo de produtos para cada loja que você tem.
                    </span>
                    <input type='text' {...register('nomeEstoque')} defaultValue={''}  className=' font-extralight text-xs text-black text-start items-start justify-start flex w-full px-2 h-8 border-2 border-gray-400 rounded-md '  placeholder='Ex: "Camiseta de manga longa"' />
                    <label className='text-base text-black text-start items-start justify-start flex w-full px-2 '>
                        Descrição
                    </label>
                    <span className='text-xs text-gray-400 text-start items-start justify-start flex w-full px-2 '>
                        Coloque uma descrição universal que se aplique a todos os produtos do combo.Ex &quot;Loja de roupas com peças de verão, inverno e meia estação localizada no endereço X&quot;
                    </span>
                    <textarea {...register('descricaoEstoque')} 
                        defaultValue={''}
                        className='font-extralight text-xs text-black text-start items-start justify-start flex w-full px-2 h-40 border-2 p-2 border-gray-400 rounded-md  resize-none' 
                        placeholder='Ex: "Loja de roupas com peças de verão, inverno e meia estação localizada no endereço X"'
                    />
                </div>

                <div className='w-full flex h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md p-5 gap-2 '>
                    <div className='w-full flex flex-col h-auto items-center justify-center gap-2 '>
                        <span className='text-black rounded-full items-center justify-start flex text-xl w-full text-start '>
                            Importar tabela de produtos
                        </span>
                        <span className='text-xs text-gray-400 text-start items-start justify-start flex w-full '>
                            Você pode importar uma tabela de produtos para adicionar ao combo de produtos.
                        </span>
                    </div>
                    <label className={` text-white rounded-lg h-10 w-96 m-auto flex items-center justify-center gap-2 cursor-pointer ${importFileLoading !== 'success' ? 'bg-[--roxo]' : ' bg-green-600 '}`}>
                        <Image src='/icon/excel.png' alt='Adicionar Produto' width={20} height={20} />
                        {
                            importFileLoading &&
                            <span className=' ml-2 flex  items-center justify-center gap-2'>
                                {importFileLoading === 'true' && <span className='text-white'>Abrindo arquivo</span>}
                                {importFileLoading === 'salvando' && <span className='text-white'>Salvando os produtos</span>}
                                {importFileLoading === 'campos' && <span className='text-white'>Criando campos</span>}
                                {importFileLoading === 'success' && 
                                    <span className='text-white text-center flex flex-col truncate '>
                                        Importado com sucesso<br />
                                        <span className='text-xs'> {nomeArquivo}</span>
                                    </span>}
                                {importFileLoading === 'error' && <span className='text-white'>Erro ao importar</span>}
                                {importFileLoading !== 'success' && importFileLoading !== 'error' && <LoadingFileExcel /> }
                            </span>
                            
                        }
                        { !importFileLoading && <span className='ml-2'>Importar produtos</span> }
                        <input type="file" className='hidden' accept=".xlsx, .xls" {...register('fileExcel')} />
                    </label>

                </div>
                <div className='w-full flex flex-col h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md p-5 gap-2 '>
                    <span className='text-black rounded-full items-center justify-start flex text-xl w-full text-start '>
                        Adicionar campos personalizados
                    </span>
                    <span className='text-xs text-gray-400 text-start items-start justify-start flex w-full '>
                        Você pode adicionar campos personalizados para poder adicionar informações sobre os que serão adicionados ao combo de produtos.
                    </span>
                    
                    <div className='w-full flex h-auto items-end justify-center rounded-md px-4 py-2 gap-2 '>
                        <span className='w-full flex flex-col h-auto items-center justify-center rounded-md gap-2 '>
                            <label className='text-lg text-black text-start items-start justify-start flex w-full px-2 '>
                                Nome do campo*
                            </label>
                            <input type='text' {...register('nomeCampo')} defaultValue={''}  className=' font-extralight text-xs text-black text-start items-start justify-start flex w-full px-2 h-8 border-2 border-gray-400 rounded-md '  placeholder='Ex: "Cor"' />
                        </span>

                        <span className='w-full flex flex-col h-auto items-center justify-center rounded-md gap-2 '>
                            <label className='text-lg text-black text-start items-start justify-start flex w-full px-2 '>
                                Tipo do campo*
                            </label>
                            <select {...register('tipoCampo')} defaultValue={''}  className=' items-center font-extralight text-xs text-black text-start justify-center flex w-full px-2 h-8 border-2 border-gray-400 rounded-md '  >
                                <option value=''>Selecione o tipo do campo</option>
                                <option value='text'>Texto curto</option>
                                <option value='textarea'>Texto longo</option>
                                <option value='number'>Número</option>
                                <option value='Imagem'>Imagem</option>
                            </select>
                        </span>
                        <span className='w-full flex flex-col h-auto items-center justify-center rounded-md gap-2 '>
                            <label className='text-lg text-black text-start items-start justify-start flex w-full px-2 '>
                                Obrigatório*
                            </label>
                            <select {...register('obrigatorio')} defaultValue={''}  className=' items-center font-extralight text-xs text-black text-start justify-center flex w-full px-2 h-8 border-2 border-gray-400 rounded-md '  >
                                <option value=''>Selecione se é obrigatório</option>
                                <option value='S'>Sim</option>
                                <option value='N'>Não</option>
                            </select>
                        </span>
                        <button onClick={() => {addNovoCampo()}} className={`cursor-pointer text-white font-bold w-1/2 rounded-lg h-8 ${ ( !watch('nomeCampo') || !watch('tipoCampo') || !watch('obrigatorio') ) && importFileLoading ? 'bg-gray-300' : 'bg-[--roxo]'} `} disabled={( !watch('nomeCampo') || !watch('tipoCampo') || !watch('obrigatorio') ) && importFileLoading}>
                            Adicionar campo
                        </button>
                    </div>
                    {msgCampposPersonalizados !== '' && (
                        <span className='text-xs text-[--roxo] text-start items-start justify-start flex w-full px-2 '>
                            {msgCampposPersonalizados}
                        </span>
                    )}

                </div>
                <span className='text-black items-center justify-start flex text-xl w-full text-start border-b border-gray-400 py-1 '>
                    Campos padrões
                </span>
                {defaultCampos({nomeCampo: 'Id',tipoCampo: 'text',obrigatorio: 'S'},'default-0')}
                {defaultCampos({nomeCampo: 'Valor',tipoCampo: 'text',obrigatorio: 'S',},'default-1')}
                {defaultCampos({nomeCampo: 'Estoque',tipoCampo: 'number',obrigatorio: 'S'},'default-2')}
                {
                    camposPersonalizados.length > 0 && (
                        <>
                            <span className='text-black items-center justify-start flex text-xl w-full text-start border-b border-gray-400 py-1 '>
                                Os campos personalizados adicionados são:
                            </span>
                            {
                                camposPersonalizados.map((campo, index) => (
                                    defaultCampos(campo, index, removerCampo)
                                ))
                            }
                        </>
                    )
                }
            </form>
    
        </>
    )
}


const defaultCampos =  (campo: any, index: any, removerCampo?: any) => {

    return (
        <div key={index} className='w-full flex h-auto items-center justify-center shadow-sm shadow-gray-500 rounded-md p-1 gap-2 px-5 '>
            <span className='text-black rounded-full items-center justify-start flex text-base w-full text-start gap-2 '>
                <b>Nome do campo:</b>
                {campo.nomeCampo}
            </span>
            <span className='text-black rounded-full items-center justify-start flex text-base w-full text-start gap-2 '>
                <b>Tipo do campo:</b>
                {campo.tipoCampo === 'text' ? 'Texto curto' : campo.tipoCampo === 'textarea' ? 'Texto longo' : campo.tipoCampo === 'number' ? 'Número' : campo.tipoCampo === 'date' ? 'Data' : campo.tipoCampo === 'time' ? 'Hora' : 'Não definido'}
            </span>
            <span className='text-black rounded-full items-center justify-start flex text-base w-full text-start gap-2 '>
                <b>Obrigatório:</b>
                {campo.obrigatorio === 'S' ? 'Sim' : 'Não'} 
            </span>
            {
                !String(index)?.includes('default') &&
                <button className='cursor-pointer text-white font-bold w-1/2 rounded-lg h-8 bg-[--roxo] ' onClick={() => {removerCampo(index)} }>
                    Remover campo
                </button>
            }
        </div>
    )
}


const LoadingFileExcel = () => {
    return (
        <>
            <div className="flex flex-row gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-.5s]"></div>
            </div>
        </>
    )
}

