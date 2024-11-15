'use client'
import React, { useState , useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form"
import { IconDeviceFloppy, IconFileUpload, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { updateAssistente } from '@/functions/assistentes/updateAssistente';
import { getAssistente } from '@/functions/assistentes/getAssistente';
import { Button } from '@/components/Button';
import { uploadFile } from '@/functions/openai/IA/uploadFile';
import z from 'zod';
import { getTreinamentoHttp } from '@/functions/getTreinamentoHttp';
import { Titles } from '@/components/Titles';
const schemaURL = z.object({
    url: z.string().url()
});


export default function PerfilAssistente ({params}: Readonly<{params: {id: string}}>) {
    console.log(params)
    const { register, watch, formState: { errors } , setValue } = useForm();

    const [assistente, setAssistente] = useState([]) as any;
    const [msgUpdate, setMsgUpdate] = useState({}) as any;
    const [msgFileUpload, setMsgFileUpload] = useState({}) as any;
    const [msgURL, setMsgURL] = useState({}) as any;

    useEffect(() => {
        (async () => {
            const response = await getAssistente({id: params.id}) as any;
            console.log(response);
            setValue('treinamento', response?.treinamento)
            setAssistente(response);
        })()
    } , [])

    const atualizareAssistente = async () => {
        console.log(watch('nome'))
        const response = await updateAssistente({
            id: params.id,
            nome: assistente?.nome,
            comunicacao: assistente?.comunicacao,
            modelo: assistente?.modelo,
            finalidade: assistente?.finalidade,
            treinamento: watch('treinamento'),
            treinamentoURL: watch('treinamentoURL'),
            assistenteId: assistente?.assistenteIdGPT
        }) as any;

        setMsgUpdate(response);

        setTimeout(() => {
            setMsgUpdate({})
        }, 10000)

    }


    const handleFile = async () => {
        const file = watch('fileTreinamento')[0];
    
        if (!file) {
            console.error('Nenhum arquivo foi selecionado');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file); // Adiciona o arquivo diretamente
        formData.append('vectorStore', assistente?.vectorStore || '');
        formData.append('assistantId', params.id);
    
        try {
            const sendFile = await uploadFile({ data: formData });
            file && setMsgFileUpload({ status: 'success', message: 'Arquivo enviado com sucesso' });
            setTimeout(() => {
                setMsgFileUpload({});
                setValue('fileTreinamento', null);
            }, 5000);
        } catch (err) {
            console.error('Erro ao fazer o upload do arquivo:', err);
        }
    };


    const getURLTreinamento = async () => {
        const url = watch('url');
        const response = await getTreinamentoHttp({ url }) as any;
        setMsgURL(response);
        console.log(response);
        const dataToText = response.data.titulos.concat(response.data.paragrafos).concat(response.data.textosExtras).join('\n');
        setValue('treinamentoURL', dataToText);
        setTimeout(() => {
            setMsgURL({});
        }, 3000);
    }

    return (
        <>
            <Titles title='Treinamento via texto' subtitle='Ensine seu assistente com textos.' />
            <textarea className='w-full min-h-96 p-2 bg-transparent shadow-sm shadow-[--azul] rounded-md ' placeholder='Digite ou cole o texto que deseja treinar seu assistente' {...register('treinamento')} />
            <Button 
                functionGet={atualizareAssistente} 
                msgUpdate={msgUpdate} 
                disabled={false} 
                text='Salvar texto' 
            />
            <Titles title='Treinamento via arquivo' subtitle='Ensine seu assistente com arquivos. ( Até 5 aquivos: .txt , .pdf , .doc , .docx )' />
            <input type='file' id='fileTreinamento' className='hidden' accept='.txt,.pdf,.doc,.docx' {...register('fileTreinamento')} />
            {
                watch('fileTreinamento') && watch('fileTreinamento').length > 0 ? (
                    console.log(watch('fileTreinamento')),
                    <>
                        <Button 
                            functionGet={handleFile}
                            msgUpdate={msgFileUpload}
                            disabled={false} 
                            text={`Salvar arquivo:  ${watch('fileTreinamento')[0]?.name}`}
                        />
                    </>
                )
                : 
                <>
                    <label htmlFor='fileTreinamento' className='h-14 w-60 flex items-center justify-center bg-[#1E90FF] text-white rounded-md cursor-pointer '>
                        <IconFileUpload className='size-10' />
                        <span className='ml-2'>Selecione um arquivo</span>
                    </label>
                </>
            }
            <Titles title='Treinamento via website' subtitle='Ensine seu assistente com textos de websites.' />
            <div className='flex items-center justify-center gap-2 w-full'>
                <input type='text' className='w-full p-2 bg-transparent shadow-sm shadow-[--azul] rounded-md ' placeholder='Digite a URL do website que deseja treinar seu assistente' {...register('url')} />
                <Button 
                    functionGet={getURLTreinamento} 
                    msgUpdate={msgURL} 
                    disabled={schemaURL.safeParse({ url: watch('url') }).success ? false : true}
                    text='Extrair website'
                />
            </div>
            {
                watch('treinamentoURL') && 
                    <>
                        <textarea className='w-full min-h-96 p-2 bg-transparent shadow-sm shadow-[--azul] rounded-md ' placeholder='Digite ou cole o texto que deseja treinar seu assistente' {...register('treinamentoURL')} />
                        <Button 
                            functionGet={atualizareAssistente} 
                            msgUpdate={msgUpdate} 
                            disabled={false} 
                            text='Salvar treinamento' 
                        />
                    </>

            }
        </>
    );
}


