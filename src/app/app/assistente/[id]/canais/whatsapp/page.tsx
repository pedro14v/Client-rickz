'use client'
import React , { useEffect, useState , useRef, MutableRefObject} from 'react';
import { useSession } from 'next-auth/react';
import { unstable_update } from '@/auth';
import { useForm, SubmitHandler, set } from "react-hook-form"
import Image from 'next/image';
import { IconCategory2, IconMicrophone, IconMicrophoneFilled, IconPaperclip, IconPhotoScan, IconRobot, IconRobotOff, IconSend, IconSquareLetterXFilled, IconTrash, IconUser, IconVideo } from '@tabler/icons-react';
import { getSessaoWhatsapp } from '@/functions/whatsapp/getSessaoWhatsapp';
import { io } from "socket.io-client";
import { Loading } from '@/components/Loading';
import { updateSessionWhatsappMsgs } from '@/functions/whatsapp/updateSessionWhatsappMsgs';
import { getAssistente } from '@/functions/assistentes/getAssistente';
import { useRouter } from 'next/navigation';
import { downloadMedia } from '@/functions/whatsapp/downloadMidia';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';



const dev = true
const socket = io(dev ?'http://localhost:5001' : 'https://backend-saas-whatsapp.up.railway.app/', {
    transports: ['websocket' , 'polling'],
    withCredentials: true,
    extraHeaders: {
        "Authorization": "WHATSAPP"
    }
});

export default function Home ({params}: Readonly<{params: {id: string}}>) {
    const {
        startRecording,
        stopRecording,
        togglePauseResume,
        recordingBlob,
        isRecording,
        isPaused,
        recordingTime,
        mediaRecorder
    } = useAudioRecorder();

    const containerRef = useRef(null);
    const router = useRouter()

    
    const { register, setValue, watch, formState: { errors } } = useForm();
    const { data: session, status, update } = useSession() as any

    const [chats, setChats] = useState<any>({})
    const [chatOpen, setChatOpen] = useState<any>()
    const [sessionID, setSessionID] = useState<string>(session?.user?.SessionWhatsapp[0]?.sessionId || '')
    const [ imgProfile, setImgProfile ] = useState<string>('')
    const [ imgProfileUserActive, setImgProfileUserActive ] = useState<string>('')
    const [assisnteIdOpenaiAI, setAssistenteIdOpenaiAI] = useState<string>()
    const [msgError, setMsgError] = useState<string>('')
    const [getChats , setGetChats ] = useState<boolean>(false)
    const [sendLoading, setSendLoading] = useState<boolean>(false)
    const [previewMidia, setPreviewMidia] = useState<any>(null)
    const [urlMidia, setUrlMidia] = useState<any>(null)
    const [audioRecorderUrlTEmp, setAudioRecorderUrlTEmp] = useState<any>(null)
    const [menuMidias, setMenuMidias] = useState<boolean>(false)

    

    const noConnect =  () => {

        setMsgError('Seu whatsapp está desconectado, por favor, reconecte-se!')
        update({
            user: {
                SessionWhatsapp: [{
                    status: 'Inativo'
                }]
            }
        })
        setChats({})
        setTimeout(() => {
            router.push(`/assistente/${params.id}/canais`)
        }, 5000)
    }


    const putChats = (data: any) => {
        setChats(data)
    }

    const putImgProfile = (imgProfile: string) => {
        setImgProfile(imgProfile)
    }

    var backupChats = {...chats};
    var backupChatOpen = {...chatOpen};

    const openChat = async (phone: number) => {
        sendLoading && setSendLoading(false)
        setPreviewMidia(null)
        setUrlMidia(null)
        setAudioRecorderUrlTEmp(null)

        if(chatOpen === 'loading') return

        if (phone === null) {
            setChatOpen(null)
            return
        }

        const chat = chats[phone]
        const qtd = chat.novaMsg
        setImgProfileUserActive(chat.image)
        setChatOpen('loading')

        const sessaoWhatsapp = await getSessaoWhatsapp({userPhone: phone, sessionId: sessionID, assistenteId: assisnteIdOpenaiAI, status: true})
        
        setChatOpen({
            userPhone: phone,
            statusIA: sessaoWhatsapp?.status,
            ...chat
        })
        setValue('iaActive', sessaoWhatsapp?.status === 'Ativo' ? true : false)

        await new Promise(r => setTimeout(r, 2000));
        
        const updatedChats = backupChats[phone] =  {
            ...chat,
            novaMsg: 0,
        }

        backupChats = {
            [phone]: updatedChats,
            ...backupChats,
        };
                 

        setChats(backupChats);
        if(qtd > 0) {
            socket.emit(`readMessages`, {clientId: sessionID, phone, qtd})
        }
    }

    const sendMsg = async () => {
        setSendLoading(true)
        console.log(chatOpen)
        const userPhone = chatOpen?.userPhone
        if(!userPhone) return console.log('userPhone:', userPhone)

        const message = watch('msgUser')

        if(!message && !urlMidia) {
            setSendLoading(false)
            return
        }

        console.log('message:', message)
        console.log('urlMidia:', urlMidia)
        if(urlMidia) {
            console.log('urlMidia:', urlMidia)
            socket.emit(`sendMessage` , {clientId: sessionID, to: userPhone, body: message, media: urlMidia})
        }

        if (message !== '') socket.emit(`sendMessage` , {clientId: sessionID, to: userPhone, body: message})

        

        setValue('msgUser', '')
        setUrlMidia(null)
        setPreviewMidia(null)
        setValue('midiaDocument', null);
        setValue('midiaVideo', null);
        setValue('midiaImage', null);
        setValue('midiaAudio', null);
        await new Promise(r => setTimeout(r, 3000));
        setSendLoading(false)
    }
  
    const updateChats = async (data:any) => {
        // {
        //     userPhone: '5511969478588',
        //     role: 'eu',
        //     msg: '2',
        //     tipo: 'Texto',
        //     time: 'Invalid Date',
        //     media: null,
        //     hasMidia: false
        //   }
        console.log('data:', data)
        const userPhone = data.userPhone
        const hasUser = chats[userPhone] !== undefined  ? true : false  
        console.log('userPhone:', userPhone)

        if(hasUser) {

            const message = data.msg
            const time = data.time
            const hasMedia = data.hasMidia
            const media = data.media
            const role = data.role

            try {
                if(!userPhone) return

                if (userPhone === chatOpen?.userPhone) {
                    backupChatOpen = {
                        ...backupChatOpen,
                        novaMsg: chatOpen?.userPhone === userPhone ? 0 : backupChatOpen.novaMsg + 1,
                        messages: [...chatOpen?.messages, { role: role, msg: message, time, hasMedia, media }]
                    };
                }
        
                // Encontra o chat atualizado
                
                backupChats[userPhone] = {
                    ...backupChats[userPhone],
                    novaMsg: chatOpen?.userPhone === userPhone ? 0 : backupChats[userPhone].novaMsg + 1,
                    messages: [...backupChats[userPhone].messages, { role, msg: message, time, hasMedia }]
                };
                
                backupChats = {
                    [userPhone]: backupChats[userPhone],
                    ...backupChats,
                };



            } catch (error) {
                console.error(error);
            }
        }

        if(!hasUser) {
            backupChats = {
                [userPhone]: data[userPhone],
                ...backupChats,
            };
        }


        
        
        
        setChats(backupChats);
        chatOpen && setChatOpen(backupChatOpen);
        
    };
    

    const updateActionIA = async (status: boolean) => {
        console.log('[ updateActionIA ]:' , status)
        const userPhone = chatOpen.userPhone
        const iaActive = status ? "Ativo" : "Inativo"
        console.log('iaActive:', iaActive )

        const att = await updateSessionWhatsappMsgs({phone: userPhone, status: iaActive})

        await update({
            user: {
                SessionWhatsapp: [{
                    sessionId: sessionID,
                    status: iaActive
                }]
            }
        }).then((i: any) => {
            console.log('update')
        }).catch((err: any) => {
            console.log('err:')
        })
        
    }

    const scrollIntoView = () => {
        const conteinerMsg = containerRef.current as any;
        if (conteinerMsg) {
            conteinerMsg.scrollTop = conteinerMsg.scrollHeight;
        }
    };

    const createBase65Midia = (arquivo: any) => {
        if (!arquivo) return;
        // return setUrlMidia(arquivo);
        const reader = new FileReader();
        reader.readAsArrayBuffer(arquivo);
        reader.onload = () => {
            const buffer = Buffer.from(reader.result as ArrayBuffer);
            const base64 = buffer.toString('base64');
            console.log('arquivo.type:', arquivo.type)
            setUrlMidia({ url: `data:${arquivo.type};base64,${base64}`, type: arquivo.type })
                
        };

        reader.onerror = (error) => {
            console.error('Error:', error);
        };
    }

    useEffect(() => {
        if (status !== 'authenticated') return
    
        if (session?.user?.SessionWhatsapp[0]?.status === 'Inativo' || session.user?.SessionWhatsapp[0]?.sessionId === undefined) {
            return 
        }
        
        let sessionId = session?.user?.SessionWhatsapp[0]?.sessionId
    
        setSessionID(sessionId)

        if (Object.keys(chats).length === 0 && sessionID !== undefined && !getChats) {
            socket.emit('getLastConversations', sessionId)
            setGetChats(true)
        }
        
        const handleChats = (data:any) => {
            putChats(data)
        };
        
        const handleNewMsgCliente = (data:any) => {
            updateChats(data)
        };
        
        const handleNewMsg = (data:any) => {
            updateChats(data)
        };
        
        const handleImgProfile = (imgProfile:any) => {
            setImgProfile(imgProfile)
        };
        
        const handleNoAuth = (errorMessage:any) => {
            console.error('Error:', errorMessage)
        };

        const handleDisconnect = () => {
            noConnect()
        }
    
        socket.on(`chats-${sessionId}`, handleChats);
        socket.on(`new-msg-cliente-${sessionId}`, handleNewMsgCliente);
        socket.on(`new-msg-${sessionId}`, handleNewMsg);
        socket.on(`img-profile-${sessionId}`, handleImgProfile);
        socket.on(`no-auth-${sessionId}`, handleNoAuth);
        socket.on(`erro-getmsgs-${sessionId}`, noConnect);
        socket.on(`disconnect-${sessionId}`, handleDisconnect);

        
        const ping = setInterval(() => {
            socket.emit(`ping`, sessionId)
        }, 15000)

        socket.on(`pong-${sessionId}`, (data) => {
            console.log('pong')
        });
    
        return () => {
            socket.off(`chats-${sessionId}`, handleChats);
            socket.off(`new-msg-cliente-${sessionId}`, handleNewMsgCliente);
            socket.off(`new-msg-${sessionId}`, handleNewMsg);
            socket.off(`img-profile-${sessionId}`, handleImgProfile);
            socket.off(`no-auth-${sessionId}`, handleNoAuth);
            socket.off(`erro-getmsgs-${sessionId}`, noConnect);
            socket.off(`disconnect-${sessionId}`, handleDisconnect)
            socket.off(`pong-${sessionId}`);
            clearInterval(ping)
        };
    }, [session, status, getChats]);


    useEffect(() => {
        const getIdAssistenteOpenAI = async () => {
            update()
            await getAssistente({id: params.id})
            .then((res : any) => {
                setAssistenteIdOpenaiAI(res?.assistenteIdGPT)
            })
        }
        getIdAssistenteOpenAI()
    }, [])

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === 'Enter') {
                sendMsg();
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
    
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (!recordingBlob) return;
        createBase65Midia(recordingBlob);
        
        const url = URL.createObjectURL(recordingBlob);
        setAudioRecorderUrlTEmp(url);
    
        console.log('recordingBlob:', recordingBlob);
    
        return () => {
            URL.revokeObjectURL(url); // Limpar o URL object quando o componente desmontar ou recordingBlob mudar
        };
    }, [recordingBlob]);

    useEffect(() => {
        const midiaDocument = watch('midiaDocument');
        const midiaVideo = watch('midiaVideo');
        const midiaImage = watch('midiaImage');
    
        const arquivo = midiaDocument && midiaDocument.length > 0 ? midiaDocument[0]
            : midiaVideo && midiaVideo.length > 0 ? midiaVideo[0]
            : midiaImage && midiaImage.length > 0 ? midiaImage[0]
            : null;
    
        if (arquivo) {
            console.log('arquivo:', arquivo);
            createBase65Midia(arquivo);
            const reader = URL.createObjectURL(arquivo);
            console.log('reader:', reader);
    
            setPreviewMidia({ src: reader, type: arquivo.type, name: arquivo.name, size: arquivo.size });
    
            return () => {
                URL.revokeObjectURL(reader); // Limpar o URL object quando o componente desmontar ou quando midiaDocument, midiaVideo, ou midiaImage mudarem
            };
        } else {
            setPreviewMidia(null);
        }
    }, [watch('midiaDocument'), watch('midiaVideo'), watch('midiaImage')]);
    
    useEffect(() => {
        scrollIntoView()
    }, [chatOpen]);

    if(Object.keys(chats).length === 0) {
        return (
            <div className=' absolute top-0 left-0 w-full flex flex-col items-center justify-center bg-slate-700 min-h-[75vh] z-[100] rounded-lg py-1 pr-1 shadow-2xl shadow-black '>                
                {
                    msgError !== '' ?
                    <Image src='/erroMensagens.gif' width={500} height={500} alt='erro nas mensagens' />
                    :
                    <Image src='/carregandoMensagens.gif' width={500} height={500} alt='carregando mensagens' />
                }
            </div>
        )
    }

    

    return (
        <>
            <div className=' absolute top-0 left-0 w-full flex items-start justify-start bg-slate-700 h-auto z-[100] rounded-lg py-1 pr-1 shadow-2xl shadow-black '>
                <div className='min-w-96 max-w-96 max-h-full flex flex-col items-start justify-start gap-5 pr-4 overflow-hidden py-2 '> 
                    <header className='w-full h-8 flex items-center justify-start px-2 gap-2 py-5 bg-white rounded-r-xl '>
                        <div className='w-1/2 h-full flex items-center justify-start ' >
                            <Image src='/icon/icon-whatsapp.png' width={100} height={100} alt='Icon-whatsapp' className='size-6' />
                            <span className='font-bold text-lg text-black items-center justify-center flex  '>
                                WhatsApp
                            </span>

                        </div>
                        <div className='w-1/2 h-full flex items-center justify-end gap-5 ' >
                            <Image src={imgProfile !== '' ? imgProfile : '/perfil-img-default/1.webp' } width={100} height={100} alt='Icon-whatsapp' className='size-14 p-1 bg-slate-700 rounded-full ' />
                        </div>
                    </header>
                    <div className='w-full h-[68vh] overflow-auto flex flex-col items-center justify-start gap-5 '>
                        {Object.keys(chats).map((phone:any, index: number) => {
                            const chat = chats[phone]; // Array de conversas para o telefone atual
                            console.log('chat :', chat)
                            if(chat?.nome === undefined || chat?.image === undefined) return null
                            return (
                                <CardChat
                                    key={`${phone}-${index}`} // Chave única combinando telefone e índice do chat
                                    nome={chat.nome}
                                    msg={chat.messages[chat.messages.length - 1].hasMedia ? 'Mídia...' : chat.messages[chat.messages.length - 1].msg}
                                    hora={chat.messages[chat.messages.length - 1].time}
                                    img={chat.image}
                                    id={phone}
                                    openChat={openChat}
                                    novaMsg={chat.novaMsg}
                                    select={chatOpen?.userPhone === phone}
                                />
                            )
                            
                        })}
                    </div>
                    
                </div>
                <div className='relative w-full max-h-full flex flex-col items-center justify-center gap-5 overflow-hidden p-2 rounded-lg '>
                    {
                        !chatOpen && 
                        <div className='w-full h-[75vh] flex items-center justify-center gap-5 '>
                            <Image src='/nenhumChat.gif' width={500} height={500} alt='Nenhum chat selecionado '/>
                        </div>
                    }

                    {
                        chatOpen === 'loading' && 
                        <div className='w-full h-[75vh] flex flex-col items-center justify-center gap-5 '>
                            <Loading />
                        </div>
                    }


                    {
                        chatOpen && chatOpen !== 'loading' &&
                        <>
                            <div className="absolute inset-0 bg-[url('/bg-whatsapp.webp')] bg-cover bg-center opacity-10 h-full "></div>
                            <div className='relative w-full h-10 flex items-center justify-start gap-2 px-2 py-1 bg-gray-600 rounded-xl drop-shadow-xl '>
                                <Image src={imgProfileUserActive || '/perfil-img-default/default.png'} width={100} height={100} alt='Icon-whatsapp' className='size-14 p-1 bg-slate-700 rounded-full' />
                                <span className='font-bold text-lg text-white items-center justify-center flex  '>
                                    {chatOpen?.nome}
                                </span>
                                <div className='absolute right-5 h-full flex items-center justify-start gap-1 '>
                                    <input type='checkbox' className='hidden' {...register('iaActive')} id='iaActive' defaultChecked={chatOpen?.statusIA === 'Ativo' ? true : false} />
                                    <Image src={'/icon/botOn.svg'} width={100} height={100} alt='Icon-whatsapp' className={`size-8 p-[2px]  rounded-full ${watch('iaActive') ? 'bg-[--azul]' : 'bg-slate-700' } `} />
                                    <label className='w-10 h-5 flex items-center justify-start bg-[--azul] rounded-xl cursor-pointer relative ' htmlFor='iaActive'  onClick={() => updateActionIA(!watch('iaActive'))}>
                                        <div className={`size-4 absolute bg-white rounded-full left-1 transition-default transition-transform transform ${!watch('iaActive') && 'translate-x-full' } `}></div>
                                    </label>
                                    <Image src={'/icon/userOn.svg'} width={100} height={100} alt='Icon-whatsapp' className={`size-8 p-[2px]  rounded-full ${watch('iaActive') ? 'bg-slate-700' : 'bg-[--azul]' } `} />
                                </div>
                            </div>

                            <div id='conteiner-msg' ref={containerRef} className='w-full overflow-x-hidden relative h-[65vh] p-2 bg-transparent rounded-md overflow-y-auto z-50 ' >
                                {
                                    <>
                                        {chatOpen?.messages && chatOpen.messages.length < chatOpen.novaMsg ? (
                                            <CardNewMsg qtd={chatOpen.novaMsg - chatOpen.messages.length} />
                                        ) : null}

                                        {chatOpen?.messages?.map((data: any, index: number) => {
                                                if (data.msg === '' || data.msg === undefined || data.msg === null) return null;
                                                return (
                                                    <Card
                                                        key={index}
                                                        origem={data.role}
                                                        msg={data.msg}
                                                        imgUser={data.role !== 'IA' ? imgProfile : session?.user?.Assistente[0]?.image}
                                                        imgAssistente={imgProfileUserActive || '/perfil-img-default/default.png'}
                                                        time={data?.time}
                                                        media={data?.media}
                                                        hasMidia={data?.hasMidia}
                                                        />
                                                );
                                            }
                                        )}
                                    
                                    </>
                                }
                                
                            </div>
                            {previewMidia && (
                                <div className="w-4/5 bg-slate-700 rounded-xl pb-10 h-4/5 flex items-center justify-center gap-5 absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-50">
                                    {renderPreview(previewMidia)}
                                    <button
                                        className="bg-[--azul] text-white rounded-md size-10 absolute bottom-5 right-5 p-2"
                                        onClick={sendMsg}
                                        disabled={sendLoading}
                                    >
                                        {sendLoading ? <Loading /> : <IconSend size={25} strokeWidth={1.5} color="#fff" className="size-full" />}
                                    </button>
                                    <button
                                        className=" fill-red-500 text-white rounded-md size-10 absolute top-5 right-5"
                                        onClick={() => setPreviewMidia(null)}
                                    >
                                        <IconSquareLetterXFilled size={25} strokeWidth={1.5} color="#fff" className="size-full" />
                                    </button>
                                </div>
                            )}
                            <div className='w-full h-10 flex items-center justify-center gap-1 z-50 relative'>
                                <div className={`rounded-lg  flex flex-col items-center justify-center gap-1 z-50 absolute bg-slate-700 shadow-xl shadow-black  left-0 overflow-hidden transition-default  ${menuMidias ? 'w-40 h-40 -top-44 left-0 ' : 'w-0 h-0 top-5 left-5'    }   `}>
                                    <input type='file' className='hidden' {...register('midiaDocument')} id='midiaDocument' accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt' />
                                    <input type='file' className='hidden' {...register('midiaVideo')} maxLength={100 * 1024 * 1024} id='midiaVideo' accept='video/*' />
                                    <input type='file' className='hidden' {...register('midiaImage')} id='midiaImage' accept='image/*' />
                                    <input type='file' className='hidden' {...register('midiaAudio')} id='midiaAudio' accept='audio/*' />
                                    <label htmlFor='midiaDocument' className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden ${menuMidias ? 'w-full' : 'w-0' } `}>
                                        <IconPaperclip size={25} strokeWidth={1.5} color={'#fff'} className='size-6 ' />
                                        Documento
                                    </label>
                                    <label htmlFor='midiaVideo' className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer  overflow-hidden ${menuMidias ? 'w-full' : 'w-0' } `}>
                                        <IconVideo size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                        Video 
                                    </label>
                                    <label htmlFor='midiaImage' className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer overflow-hidden ${menuMidias ? 'w-full' : 'w-0' } `}>
                                        <IconPhotoScan size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                        Imagem
                                    </label>
                                    <label htmlFor='midiaAudio' className={`p-1 text-white rounded-md w-full relative flex gap-5 cursor-pointer' overflow-hidden ${menuMidias ? 'w-full' : 'w-0' } `}>
                                        <IconMicrophone size={25} strokeWidth={1.5} color={'#fff'} className='size-6' />
                                        Audio
                                    </label>
                                </div>
                                <button className={`p-2 bg-[--azul] text-white rounded-md size-10 relative transition-default ${menuMidias ? 'rotate-45 size-8 mr-2' : 'rotate-0 size-10' } `} onClick={() => setMenuMidias(!menuMidias)}>
                                    <IconCategory2 size={25} strokeWidth={1.5} color={'#fff'} className='size-full' />
                                </button>

                                {
                                    audioRecorderUrlTEmp ?
                                        <audio src={audioRecorderUrlTEmp} controls className='w-full p-1 bg-transparent h-full text-white rounded-md bg-slate-700' />
                                    :
                                        <input type='text' autoComplete="off"  className='w-full p-1 bg-transparent border border-[--azul] h-full text-white shadow-sm shadow-[--azul] rounded-md bg-slate-700' placeholder='Digite uma mensagem...' {...register('msgUser')} />
                                }
                                <button className='p-1 text-white rounded-md w-auto relative flex gap-5 cursor-pointer'>
                                    {isRecording ? 
                                        <>
                                            <span className='text-white text-xs flex flex-col '>
                                                <IconMicrophoneFilled size={25} strokeWidth={1.5} className='size-6 fill-red-600 animate-pulse ' onClick={() => { stopRecording() ; setSendLoading(false) }} />
                                                {recordingTime}
                                            </span>
                                        </>
                                        : 
                                        audioRecorderUrlTEmp ? 
                                        <IconTrash size={25} strokeWidth={1.5} color={'#fff'} className='size-6' onClick={() => { setAudioRecorderUrlTEmp(null) ; setSendLoading(false) }} />
                                        :
                                        <IconMicrophone size={25} strokeWidth={1.5} color={'#fff'} className='size-6' onClick={() => { startRecording() ; setSendLoading(false) }} />
                                    }
                                </button>
                                <button className='p-2 bg-[--azul] text-white rounded-md size-10 relative ' onClick={() => sendMsg()} disabled={sendLoading}>
                                    {sendLoading ? <Loading isResponsive /> : <IconSend size={25} strokeWidth={1.5} color={'#fff'} className='size-full' />}
                                </button>
                            </div>
                        </>

                    }
                
                </div>

            </div>
        </>
    )
}


const CardChat = ({nome, msg, hora, img , id , openChat, novaMsg,select }: {nome: string, msg: string, hora: string, img: string, id: number, openChat: any , novaMsg: number, select: boolean}) => {
    return (
        <div className={`relative w-full h-auto flex items-center justify-start gap-2 px-2 cursor-pointer ${select && 'shadow-inner shadow-black rounded-r-md '}  `} onClick={() => { select ? openChat(null) : openChat(id) } }>
            {
                select && <div className='absolute left-0 w-2 h-full bg-gradient-to-t from-[--azul] to-[--roxo] rounded-r-xl '></div>
            }
            <div className='relative flex items-center justify-start gap-2 size-16 '>
                <Image src={img} width={100} height={100} alt='Icon-whatsapp' className='size-14 p-1 rounded-full ' />
                {
                    novaMsg > 0 && <span className='absolute animate-pulse top-0 right-0 w-5 h-5 bg-[--azul] text-white text-xs rounded-full flex items-center justify-center '>{novaMsg}</span>
                }
            </div>
            <div className={`font-bold text-xs items-start justify-center flex flex-col w-full  ${!select && 'border-gray-600 border-b'} py-2 text-gray-400 `}>	
                <div className='flex items-center justify-between gap-2 w-full '>
                    <span className='text-gray-200 text-lg '>{nome}</span>
                    <span>{hora}</span>
                </div>
                <p className='w-60 truncate '>
                    {msg}
                </p>
            </div>
        </div>
    )
}

const CardNewMsg = ({qtd} : {qtd: number}) => {
    return (
        <div className='w-full h-10 flex items-center justify-center gap-2 px-2 py-1 bg-gray-600 rounded-xl drop-shadow-xl '>
            <span className='font-bold text-lg text-white items-center justify-center flex  '>
                 Nova(s) mensagem(s): <b>{qtd}</b>
            </span>
        </div>
    )
}

const Card = ({origem, msg, imgUser, imgAssistente , key, time , media , hasMidia} : {origem?: "eu" | "cliente" | 'IA' , msg:string , imgUser: string , imgAssistente: string, key: number, time: string, media : any , hasMidia: boolean}) => {
    const [newUrl, setNewUrl] = useState('');
    console.log('media:', media)
    useEffect(() => {
        if (media?.url) {
            console.log('media:', media)
            const buffer = async () => {
                try {
                    const typedArray = new Uint8Array(media.url);
                    const type = "Image" ? 'image/jpeg' : "Audio" ? 'audio/wav' : "Video" ? 'video/mp4' : 'application/pdf';
                    const blob = new Blob([typedArray], { type: type});
                    // Converte ArrayBuffer em Blob
                    const url = URL.createObjectURL(blob);
                    setNewUrl(url);

                    // Cleanup function to revoke the object URL
                    return () => {
                        URL.revokeObjectURL(url);
                    };
                } catch (error) {
                    console.error('Error processing media buffer:', error);
                }
            };
            buffer();
        }
    }, [media?.url]);



    if (media?.url && !newUrl) return <Loading />;

    
    return (
        <div className={`w-full h-auto items-start justify-start mb-5 border-gray-600 gap-5 p-2  ${origem !== 'cliente' ? ' flex flex-row-reverse ' : 'flex' } `} key={key}>
            {
                origem === 'eu' && <Image src={imgUser} width={30} height={30} alt={''} className=' rounded-full ' />
            }
            {
                origem === 'cliente' && <Image src={imgAssistente} width={30} height={30} alt={''} className=' rounded-full ' />
            }
            {
                origem === 'IA' && <Image src={imgUser} width={30} height={30} alt={''} className=' rounded-full ' />
            }
            
            <span className={`relative font-semibold text-black items-start justify-start flex text-sm w-auto h-auto resize-none  rounded-xl  pb-2  ${!hasMidia && 'bg-slate-200 p-3' } `}>
                {
                    hasMidia && media.url ? 
                        <>

                            {media.tipo === 'Image' && (
                                <Image
                                    src={newUrl}
                                    alt="Media"
                                    width={300}
                                    height={300}
                                />
                            )}
                            {media.tipo === 'Audio' && (
                                <audio src={newUrl} controls />
                            )}
                            {media.tipo === 'Video' && (
                                <video src={newUrl} controls width={300} height={300} />
                            )}
                        </>
                    
                    :
                    <span dangerouslySetInnerHTML={{ __html: String(msg).replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>') }} />
                }
                <span className={`absolute bottom-[-20px]  text-xs text-gray-500 font-semibold ${origem !== 'cliente' ? 'right-0' : 'left-0' } `}>
                    {time}
                </span>
            </span>
        </div>
    )
}


const renderPreview = (previewMidia: any) => {
    if (!previewMidia) return null;

    if (previewMidia.type.startsWith('image/')) {
      return (
        <div className="flex flex-col items-center size-full">
          <Image src={previewMidia.src} width={500} height={500} alt="Preview da Imagem " className='w-auto h-full' />
          <p className="text-white mt-2">{previewMidia.name}</p>
        </div>
      );
    }

    if (previewMidia.type.startsWith('video/')) {
      return (
        <div className="flex flex-col items-center">
          <video src={previewMidia.src} controls width={500} height={500} className='size-5/6 shadow-md shadow-black '  />
          <p className="text-white mt-2">{previewMidia.name}</p>
        </div>
      );
    }

    if (previewMidia.type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center">
          <embed src={previewMidia.src} type="application/pdf" width={500} height={500} />
          <p className="text-white mt-2">{previewMidia.name}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center text-white">
        <p>Arquivo: {previewMidia.name}</p>
        <p>Tamanho: {(previewMidia.size / 1024).toFixed(2)} KB</p>
      </div>
    );
};


