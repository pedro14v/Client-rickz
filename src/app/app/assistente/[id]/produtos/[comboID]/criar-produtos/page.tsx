'use client';
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { set, z, ZodSchema, ZodTypeAny } from 'zod';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCategory2, IconEdit, IconPhotoScan, IconSquareRoundedX } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import { addProdutoNoCombo, getProdutosDoCombo, removeProdutoDoCombo } from '@/functions/assistentes/combos/combo';
import { uploadImg } from '@/functions/cloudinary/uploadImg';

type FormData = {
    id: string;
    defaultValor: number;
    defaultEstoque: number;
    [key: string]: any;
};

interface Field {
    nomeCampo: string;
    tipoCampo: 'text' | 'textarea' | 'number' | 'Imagem';
    obrigatorio: 'S' | 'N';
}

export default function CriarProdutos({ params }: { params: { comboID: string } }) {
    const { data: session, update } = useSession() as any;
    const comboID = params.comboID;
    const router = useRouter();

    const [fields, setFields] = useState<Field[]>([]);
    const [schema, setSchema] = useState<ZodSchema>(z.object({}));
    const [fieldsImages, setFieldsImages] = useState<string[]>([]);
    const [novoProduto, setNovoProduto] = useState<boolean>(false);
    const [idNovoProduto, setIdNovoProduto] = useState<string>('');
    const [combo, setCombo] = useState<any>({});
    const [menuActions, setMenuActions] = useState<string>('');
    const [loading, setLoading] = useState<'loading' | 'success' | 'error' | ''>('');
    const [openProduct, setOpenProduct] = useState<any | null>([]);
    const [produtosAdicionados, setProdutosAdicionados] = useState<any[]>([]);
    const[ actionActiveInMoment, setActionActiveInMoment ] = useState<boolean>(false)


    const { control, handleSubmit, reset, formState: { errors }, register, watch , setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
    }) as any;

    useEffect(() => {
        if (session?.user?.Combos) {
            const combo = session.user.Combos.find((combo: any) => combo.id === comboID);
            setCombo(combo);

            const produtosDoCombo = async () => {
                console.log(combo?.id);
                if (!combo?.id) return;
                const produtos = await getProdutosDoCombo(combo?.id) as any;
                console.log(produtos);
                if(produtos) {
                    setProdutosAdicionados([...produtos?.JSON])
                }
            }
            produtosDoCombo()
            if (combo?.campos) {
                setFields(combo.campos);

                const schemaFields: Record<string, ZodTypeAny> = {
                    id: z.string(),
                    defaultValor: z.preprocess((val) => {
                        if (typeof val === 'string') {
                            // Convert commas to periods for decimal parsing
                            const cleanedValue = val.replace(/\s/g, '').replace(',', '.');
                            const parsedValue = parseFloat(cleanedValue);
                            return isNaN(parsedValue) ? undefined : parsedValue; // Return undefined if not a number to trigger validation error
                        }
                        return val;
                    }, z.number({
                        required_error: 'Valor é obrigatório.',
                        invalid_type_error: 'O campo deve conter apenas números.',
                    }).min(1, { message: 'O valor deve ser maior que 0.' })),
                    
                    defaultEstoque: z.preprocess((val) => {
                        if (typeof val === 'string') {
                            const cleanedValue = val.replace(/\s/g, '').replace(',', '.');
                            const parsedValue = parseFloat(cleanedValue);
                            return isNaN(parsedValue) ? undefined : parsedValue; // Same handling here
                        }
                        return val;
                    }, z.number({
                        invalid_type_error: 'O campo deve conter apenas números.',
                    }).min(0, { message: 'O estoque deve ser maior ou igual a 0.' }))
                };
                

                const imageFields: string[] = [];

                combo.campos.forEach((field: Field) => {
                    const { nomeCampo, tipoCampo, obrigatorio } = field;

                    if (tipoCampo === 'text') {
                        schemaFields[nomeCampo] = obrigatorio === 'S'
                            ? z.string().min(1, { message: 'O campo deve ter no mínimo 1 caracter.' }).max(55, { message: 'O campo deve ter no máximo 55 caracteres.' })
                            : z.string().optional();
                    }

                    if (tipoCampo === 'textarea') {
                        schemaFields[nomeCampo] = obrigatorio === 'S'
                            ? z.string().min(30, { message: 'O campo deve ter no mínimo 30 caracteres.' }).max(255, { message: 'O campo deve ter no máximo 255 caracteres.' })
                            : z.string().optional();
                    }

                    if (tipoCampo === 'number') {
                        schemaFields[nomeCampo] = obrigatorio === 'S'
                            ? z.preprocess((val) => {
                                if (typeof val === 'string') {
                                    const cleanedValue = val.replace(/\s/g, '').replace(',', '.');
                                    const parsedValue = parseFloat(cleanedValue);
                                    return isNaN(parsedValue) ? undefined : parsedValue;
                                }
                                return val;
                            }, z.number().min(0, { message: 'O valor deve ser maior ou igual a 0.' }))
                            : z.preprocess((val) => {
                                if (typeof val === 'string') {
                                    const cleanedValue = val.replace(/\s/g, '').replace(',', '.');
                                    const parsedValue = parseFloat(cleanedValue);
                                    return isNaN(parsedValue) ? undefined : parsedValue;
                                }
                                return val;
                            }, z.number().optional());
                    }

                    if (tipoCampo === 'Imagem') {
                        imageFields.push(nomeCampo);
                        schemaFields[nomeCampo] = obrigatorio === 'S'
                            ? z.custom<FileList>((val) => val instanceof FileList && val.length > 0, {
                                message: 'O campo é obrigatório.',
                            })
                            : z.custom<FileList>((val) => val instanceof FileList || val === undefined, {
                                message: 'O campo deve ser um arquivo ou vazio se opcional.',
                            });
                    }
                });

                setFieldsImages(imageFields);
                setSchema(z.object(schemaFields));
            }
        }

        setIdNovoProduto(uuidv4());
    }, [session]);

    const onSubmit: SubmitHandler<FormData> = async (data : any) => {

        try {
            await schema.parseAsync(data);

            for (const field of fieldsImages) {
                const files = watch(field);
                const hasFile = files?.[0]?.size > 0 ? true : false;
                delete data[field];
                let novoValor = '';
            
                if (hasFile) {
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(files[0]);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = (error) => reject(error);
                    });
            
                    const uploadInCloudinary = await uploadImg(base64);
                    console.log(uploadInCloudinary);
                    if (uploadInCloudinary) {
                        novoValor = uploadInCloudinary;
                    }
                }
                console.log(novoValor);
                data[field] = novoValor;
            }
            
            data.defaultValor = watch('defaultValor')
            data.defaultEstoque = watch('defaultEstoque')

            const newProdutosAdicionados = produtosAdicionados.filter((produto) => produto?.id !== data?.id);
            
            const newData = {
                comboID,
                produto: [
                    {
                        id: data.id,
                        JSON: JSON.stringify(data)
                    },
                    ...newProdutosAdicionados
                ]
                
            } as any
            const addProduto = await addProdutoNoCombo(JSON.stringify(newData));
            console.log(addProduto);
            setLoading('success');

            update()
            
            setTimeout(() => window.location.reload(), 3000);
        } catch (err: any) {
            console.log(err);
            setLoading('error');
            setTimeout(() => setLoading(''), 5000);
        }
    };

    const handleEditProduct = async (data: any) => {
        setOpenProduct([JSON.parse(data.JSON)]);
        setNovoProduto(true);
        setIdNovoProduto(data.id);
        setValue('id', data.id);
    }

    const handleDeleteProduct = async (data: any) => {
        const novaLista = produtosAdicionados.filter((produto) => produto.id !== data.id);
        const deleteProduct = await removeProdutoDoCombo(JSON.stringify({ comboID, produto: novaLista }));
        if(deleteProduct.status === 'success') {
            update();
            setTimeout(() => {setProdutosAdicionados(novaLista); setActionActiveInMoment(false)}, 3000);
        }
    }



    useEffect(() => {
        console.log(openProduct);
        if(!openProduct || openProduct.length === 0) {
            console.log('reset');
            // resetar campos
            reset();
            return;
        }
        openProduct.some((produto: any) => {
            const fields = Object.keys(produto)
            fields.forEach((field) => {
                field === 'id' ? setIdNovoProduto(produto[field]) : setValue(field, produto[field]);
            });
        });
    },[openProduct]);



    return (
        <>
            <div className='w-full flex h-auto items-start justify-center border-b border-gray-600 py-2 gap-5'>
                <div className='flex flex-col w-full justify-between items-start gap-2'>
                    <span className='font-bold text-black rounded-full items-center justify-center flex text-xl'>
                        {
                            openProduct ? 'Editar Produto' : 'Criar Produto'
                        }
                    </span>
                    <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs'>
                        {
                            openProduct ? 'Edite o produto' : 'Adicione um novo produto a este combo.'
                        } 
                    </span>
                </div>
                
                <button onClick={() => {setNovoProduto(!novoProduto); setOpenProduct(null); setIdNovoProduto(uuidv4()); }} className='bg-[--roxo] text-white rounded-lg h-10 w-full m-auto flex items-center justify-center' disabled={fields.length === 0}>
                    {fields?.length === 0 ? (
                        <>
                            <span className='animate-spin size-6 border-r-2 border-white rounded-full mr-2'></span>
                            <span>Carregando campos personalizados...</span>
                        </>
                    ) : (
                        novoProduto || openProduct?.lenght > 0 ? 'Fechar' : 'Adicionar Produto'
                    )}
                </button>
            </div>
            <div className={`w-full flex flex-col items-center justify-start shadow-sm shadow-gray-500 rounded-md gap-2 transition-default ${novoProduto ? 'h-[45dvh] overflow-y-auto p-5' : 'h-0 overflow-hidden'}`}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col w-full gap-2' id='form'>
                    <div className='flex w-full justify-between items-start gap-10'>
                        <div className='flex flex-col w-1/3 gap-2'>
                            <label className='text-sm text-gray-600' htmlFor='id'>
                                ID 
                            </label>
                            <input type="hidden" {...register('id')} defaultValue={idNovoProduto} />
                            <span className='border border-black h-6 rounded-lg px-5'>
                                {idNovoProduto}
                            </span>
                        </div>
                        <div className='flex flex-col w-1/3 gap-2'>
                            <label className='text-sm text-gray-600' htmlFor='valorNovoProduto'>
                                Valor
                            </label>
                            <input {...register('defaultValor', { valueAsNumber: true })} type="text" id='valorNovoProduto' className='border border-black h-6 rounded-lg px-5' />
                            {errors.defaultValor && <span className='text-red-600 text-xs'>{errors.defaultValor.message}</span>}
                        </div>
                        <div className='flex flex-col w-1/3 gap-2'>
                            <label className='text-sm text-gray-600' htmlFor='estoqueNovoProduto'>
                                Estoque
                            </label>
                            <input {...register('defaultEstoque', { valueAsNumber: true })} type="text" id='estoqueNovoProduto' className='border border-black h-6 rounded-lg px-5' />
                            {errors.defaultEstoque && <span className='text-red-600 text-xs'>{errors.defaultEstoque.message}</span>}
                        </div>
                    </div>
                    {fields.map((field, index) => (
                        <React.Fragment key={index}>
                            {field.tipoCampo === 'text' && (
                                <span className='flex flex-col w-full'>
                                    <label className='text-sm text-gray-600' htmlFor={field.nomeCampo}>
                                        {field.nomeCampo}
                                    </label>
                                    <input type="text" className='border border-black h-6 rounded-lg px-5' {...register(field.nomeCampo)} />
                                    {errors[field.nomeCampo] && <span className='text-red-600 text-xs'>{errors[field.nomeCampo]?.message}</span>}
                                </span>
                            )}
                            {field.tipoCampo === 'textarea' && (
                                <span className='flex flex-col w-full'>
                                    <label className='text-sm text-gray-600' htmlFor={field.nomeCampo}>
                                        {field.nomeCampo}
                                    </label>
                                    <textarea {...register(field.nomeCampo)} className='border border-black h-20 rounded-lg px-5 resize-none' />
                                    {errors[field.nomeCampo] && <span className='text-red-600 text-xs'>{errors[field.nomeCampo]?.message}</span>}
                                </span>
                            )}
                            {field.tipoCampo === 'number' && (
                                <span className='flex flex-col w-full'>
                                    <label className='text-sm text-gray-600' htmlFor={field.nomeCampo}>
                                        {field.nomeCampo}
                                    </label>
                                    <input type="text" className='border border-black h-6 rounded-lg px-5' {...register(field.nomeCampo, {valorAsNumber: true })} />
                                    {errors[field.nomeCampo] && <span className='text-red-600 text-xs'>{errors[field.nomeCampo]?.message}</span>}
                                </span>
                            )}
                        </React.Fragment>
                    ))}

                    {fieldsImages.length > 0 && (
                        <>
                            <div className='w-full flex flex-col h-auto items-start justify-center border-b border-gray-600 py-2'>
                                <span className='text-black rounded-full items-center justify-center flex text-base'>
                                    Mídias do produto
                                </span>
                                <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs'>
                                    As imagens deverão focar bem no produto para o assistente poder identificar.
                                </span>
                            </div>
                            <div className='flex flex-wrap w-full gap-2'>
                                {fieldsImages.map((field, index) => {
                                    const files = watch(field);
                                    const hasFile = files?.[0]?.size > 0 ? true : false;
                                    const file = hasFile ? files[0] : null;
                                    const url = file ? URL.createObjectURL(file) : openProduct?.[0]?.[field] ? openProduct?.[0]?.[field] : null;
                                    return (
                                        <div key={index} className='flex flex-col w-auto gap-1'>
                                            <span className={`text-black w-auto h-auto flex items-center justify-center ${errors[field] ? 'text-red-600 text-xs' : 'text-gray-600'}`}>
                                                {field}
                                            </span>
                                            <label className='text-sm bg-gray-400 size-28 relative rounded-md cursor-pointer' htmlFor={field + index}>
                                                {!url ? (
                                                    <IconPhotoScan className='size-full' />
                                                ) : (
                                                    <Image src={url} alt={`${field}${index}`} width={160} height={160} className='w-full h-full image-cover image-center ' />
                                                )}
                                            </label>
                                            <input
                                                type="file"
                                                className='hidden'
                                                defaultValue={null}
                                                id={field + index}
                                                accept='image/*'
                                                {...register(field)}
                                            />
                                            {errors[field] && <span className='text-red-600 text-xs'>{errors[field]?.message}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    <button type="submit" className={`  rounded-lg h-10 w-1/2 m-auto flex items-center justify-center ${loading === 'success' ? 'bg-green-500 text-black ' : 'bg-[--roxo] text-white' } `} onClick={() => setLoading('loading')}>
                        {
                            loading === 'loading' && <div className='animate-spin w-8 h-8 border-r-2 border-white rounded-full mr-2' />
                        }
                        {
                            loading === 'success' ? 'Produto adicionado / salvo' : 'Adicionar / Salvar Produto'
                        }
                    </button>
                </form>
            </div>

            <div className='w-full flex flex-col h-auto items-start justify-center border-b border-gray-600 py-2'>
                <span className='font-bold text-black rounded-full items-center justify-center flex text-xl'>
                    Produtos adicionados
                </span>
            </div>
            {
                !produtosAdicionados || produtosAdicionados.length === 0 ?
                <span className='text-black rounded-full items-center justify-center flex text-sm'>
                    Nenhum produto adicionado
                </span>
                :
                <table className='w-full table-auto'>
                    <thead>
                        <tr className='bg-gray-200 border border-gray-400'>
                            <th className='text-center'>ID</th>
                            <th className='text-center'>{fields[0]?.nomeCampo}</th>
                            <th className='text-center'>{fields[1]?.nomeCampo}</th>
                            <th className='text-center'>Estoque</th>
                            <th className='text-center'>Preço</th>
                            <th className='text-center'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            produtosAdicionados.map((produto: any, index: number) => {
                                const jsonProduto = JSON.parse(produto.JSON)
                                return (
                                    <tr key={index} className='border border-gray-400 '>
                                        <td className='text-center'>{produto.id}</td>
                                        <td className='text-center'>{jsonProduto[fields[0]?.nomeCampo]}</td>
                                        <td className='text-center'>{jsonProduto[fields[1]?.nomeCampo]}</td>
                                        <td className='text-center'>{jsonProduto.defaultEstoque}</td>
                                        <td className='text-center'>{jsonProduto.defaultValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className='flex items-center justify-center'>
                                            <div className='w-1/3 flex flex-col h-auto items-end justify-center rounded-md px-5 gap-1 relative'>
                                                 <button className={`cursor-pointer flex-col flex items-center justify-center font-bold w-auto rounded-lg h-10 text-black transition-default ${menuActions === produto.id+index ? 'rotate-45 scale-125' : 'rotate-0 scale-100'} ${actionActiveInMoment && 'text-gray-400 opacity-40 animate-pulse '}  `} disabled={actionActiveInMoment} onClick={() => setMenuActions(menuActions === produto.id+index ? '' : produto.id+index)}>
                                                     <IconCategory2 size={25} />
                                                 </button>
                                                 <div className={`rounded-lg flex flex-col items-center justify-center gap-1 z-50 absolute bg-slate-700 shadow-xl shadow-black overflow-hidden transition-default ${menuActions === produto.id+index ? 'w-60 h-20 -top-20 right-6 px-5' : 'w-0 h-0 top-6 right-6'}`} onBlur={() => setMenuActions('')}>
                                                     <button className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden hover:scale-105 ${menuActions === produto.id+index ? 'w-full' : 'w-0'}`} onClick={() => {handleEditProduct(produto) ; setMenuActions('')} }>
                                                         <IconEdit size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                                         Ver / Editar
                                                     </button>
                                                     <button className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden hover:scale-105 ${menuActions === produto.id+index ? 'w-full' : 'w-0'}`} onClick={() => {handleDeleteProduct(produto) ; setMenuActions(''); setActionActiveInMoment(true)} }>
                                                         <IconSquareRoundedX size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                                         Excluir produto
                                                     </button>
                                                 </div>
                                             </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

            }
        </>
    );
}

