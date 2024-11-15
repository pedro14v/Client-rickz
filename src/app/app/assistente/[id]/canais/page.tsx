'use client'
import React , { use, useEffect, useState} from 'react';
import { useSession } from 'next-auth/react';
import { useForm, SubmitHandler, set } from "react-hook-form"
import Image from 'next/image'; 
import { CardConnect } from '@/components/components-Canais/CardConnect';
import { useRouter } from 'next/navigation';
import { createSessionID } from '@/functions/whatsapp/creteSessionID';
import { updateSessao } from '@/functions/whatsapp/updateSessao';
import { io } from "socket.io-client";
import { Loading } from '@/components/Loading';
import { CardConnectTelegram } from '@/components/components-Canais/CardConnectTelegram';


const dev = true
const socket = io(dev ?'http://localhost:5001' : 'https://backend-saas-whatsapp.up.railway.app/', {
    transports: ['websocket' , 'polling'],
    withCredentials: true,
    extraHeaders: {
        "Authorization": "WHATSAPP"
    }
});


export default function PerfilAssistente ({params}: Readonly<{params: {id: string}}>) {


    const router = useRouter()
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { data: session, status, update } = useSession() as any
    console.log('session:', session)    
    const [canal, setCanal] = useState<string>('')
    const [qrCodeWhatsapp, setQrCodeWhatsapp] = useState<{qrCode: String, status: 'Ativo' | 'Inativo' }>({qrCode: '', status: session?.user?.SessionWhatsapp[0]?.status || 'Inativo'})

    const [sessionID, setSessionID] = useState<string>(session?.user?.SessionWhatsapp[0]?.sessionId || '') as any
    const [getSessao, setGetSessao] = useState<boolean>(false)
    const [imageProfileConectWhatsapp, setImageProfileConectWhatsapp] = useState('')
    const [whatsappAutenciado, setWhatsappAutenciado] = useState<boolean>(false)

    useEffect(() => {
        if (status !== 'authenticated') return;

        const sessionId = session?.user?.SessionWhatsapp[0]?.sessionId;
        
        if(sessionId === undefined) return

        

        socket.on(`qr-${sessionId}`, handleQrCode);
        socket.on(`session-${sessionId}`, handleSession);
        socket.on(`imgProfile-${sessionId}`, handleImgProfile);
        socket.on(`sync-progress-${sessionId}`, (data) => {
            console.log('sync-progress:', data)
        });
        socket.on('error', (errorMessage) => {
            console.error('Error:', errorMessage);
        });

        socket.on(`disconnect-${sessionId}`, () => {
            console.log('sessao-disconnect')
            setQrCodeWhatsapp({qrCode: '', status: 'Inativo'})
            setWhatsappAutenciado(false)
        });

        canal === '' &&
        session.user.SessionWhatsapp[0].status === 'Ativo' ? setWhatsappAutenciado(true) : setWhatsappAutenciado(false)

        socket.emit(`ping`, sessionId)

        const ping = setInterval(() => {
            socket.emit(`ping`, sessionId)
        }, 15000)
        socket.on(`pong-${sessionId}`, (data) => {
            console.log('pong:', data)
        });


        return () => {
            socket.off(`qr-${sessionId}`);
            socket.off(`session-${sessionId}`);
            socket.off(`imgProfile-${sessionId}`);
            socket.off('error');
            socket.off(`disconnect-${sessionId}`);
            socket.off(`pong-${sessionId}`);
            socket.off(`sync-progress-${sessionId}`);
            clearInterval(ping)
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, session, updateSessao,qrCodeWhatsapp,whatsappAutenciado,setQrCodeWhatsapp ,setWhatsappAutenciado, setImageProfileConectWhatsapp]);

    const handleQrCode = (qrUrl: any) => {
        console.log('qr:', qrUrl);
        setQrCodeWhatsapp(prevState => ({ ...prevState, qrCode: qrUrl }));
    };

    const handleImgProfile = (imgProfile: any) => {
        console.log('imgProfile:', imgProfile);
        setImageProfileConectWhatsapp(imgProfile)
    }


    const handleSession = async (data: any) => {
        console.log('data:', data + '  ' + sessionID);
        setQrCodeWhatsapp({qrCode: '', status: 'Ativo'});
        setWhatsappAutenciado(true)
        // await updateSessao({
        //     sessionId: sessionID,
        //     status: 'Ativo',
        // })
    };


    useEffect(() => {
        if(canal === '' && getSessao) {
            setGetSessao(false)
            console.log(whatsappAutenciado)
            setQrCodeWhatsapp({qrCode: '', status: qrCodeWhatsapp.status})
            socket.emit(`close-qr-generate`, sessionID)
            return
        }
    }, [canal])



    const openCardConnect = async (canal: string) => {

        if(session.user.SessionWhatsapp[0].status === 'Ativo') {
            setWhatsappAutenciado(true)
            return
        }

        let sessionId = session?.user?.SessionWhatsapp[0]?.sessionId
        let assistenteId = session?.user?.Assistente.find((assistente : any) => assistente.id === params.id)?.assistenteIdGPT
     
        if(sessionId === undefined) {
            sessionId = await createSessionID(session?.user?.id, assistenteId)
        }

        if(canal === 'Whatsapp') {
            setSessionID(sessionId)
        }

        console.log('createClient:')
        socket.emit('createClient', {sessionId: sessionId, assistenteId: assistenteId})

        setCanal(canal)
        setGetSessao(true)
    }

    const openChatWhatsapp = async () => {
        router.push(`/assistente/${params.id}/canais/whatsapp`)
    }

    return (
        <>
            <div className='w-full flex flex-col h-auto  items-start justify-center border-b border-gray-600 py-2 '>
                <span className='font-bold text-black rounded-full items-center justify-center flex text-xl '>
                    Canais
                </span>
                <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs '>
                    Define os canais que seu assistênte vai estar conectado respondendo seus clientes.
                </span>
            </div> 
            {
                status !== 'authenticated' ?
                    <Loading />
                :        
                <div className='relative w-full min-h-[30rem] flex items-start justify-start gap-5 flex-wrap '>
                    {
                        canal === 'Whatsapp' && <CardConnect setCanal={setCanal} qrCode={qrCodeWhatsapp.status === 'Ativo' ? imageProfileConectWhatsapp : String(qrCodeWhatsapp.qrCode)} status={qrCodeWhatsapp.status || session?.user?.SessionWhatsapp[0]?.status} />
                    }
                    {
                        canal === 'Telegram' && <CardConnectTelegram assistenteID={params.id} setCanal={setCanal} token={qrCodeWhatsapp.status === 'Ativo' ? imageProfileConectWhatsapp : String(qrCodeWhatsapp.qrCode)} status={qrCodeWhatsapp.status || session?.user?.SessionWhatsapp[0]?.status} />
                    }
                    {
                        canal === 'Instagram' && <CardConnect setCanal={setCanal} qrCode={qrCodeWhatsapp.status === 'Ativo' ? imageProfileConectWhatsapp : String(qrCodeWhatsapp.qrCode)} status={qrCodeWhatsapp.status || session?.user?.SessionWhatsapp[0]?.status} />
                    }
                    {
                        session?.user?.SessionWhatsapp.status === 'Ativo' || qrCodeWhatsapp.status === 'Ativo' || whatsappAutenciado ?
                            <Card title='Whatsapp' descrição='Responda via Whatsapp' functionAction={openChatWhatsapp} buttonText='Abrir chat' imageProfileConect={session?.user?.SessionWhatsapp[0]?.imageProfile} imgIcon='/icon/icon-whatsapp.png' />
                        :
                            <Card title='Whatsapp' descrição='Responda via Whatsapp' functionAction={openCardConnect} buttonText='Conectar'  imgIcon='/icon/icon-whatsapp.png' />
                    }
                    {
                        session?.user?.SessionWhatsapp.status === 'Ativo' || qrCodeWhatsapp.status === 'Ativo' || whatsappAutenciado ?
                            <Card title='Instagram' descrição='Responda via Instagram' functionAction={openChatWhatsapp} buttonText='Abrir chat' imageProfileConect={session?.user?.SessionWhatsapp[0]?.imageProfile} imgIcon='/icon/icon-instagram.png' />
                        :
                            <Card title='Instagram' descrição='Responda via Instagram' functionAction={openCardConnect} buttonText='Conectar'  imgIcon='/icon/icon-instagram.png' />
                    }
                    {
                        session?.user?.SessionWhatsapp.status === 'Ativo' || qrCodeWhatsapp.status === 'Ativo' || whatsappAutenciado ?
                            <Card title='Telegram' descrição='Responda via Telegram' functionAction={openChatWhatsapp} buttonText='Abrir chat' imageProfileConect={session?.user?.SessionWhatsapp[0]?.imageProfile} imgIcon='/icon/icon-telegram.webp' />
                        :
                            <Card title='Telegram' descrição='Responda via Telegram' functionAction={openCardConnect} buttonText='Conectar'  imgIcon='/icon/icon-telegram.webp' />
                    }
                </div>
            }
            
        
        </>
    );
}


const Card = ({title, descrição, functionAction , buttonText, imageProfileConect, imgIcon }: {title: string, descrição: string, functionAction: any , buttonText : "Abrir chat" | "Conectar" , imageProfileConect? :string , imgIcon: string, imageProfileConectWhatsap?: string}) => {
    return (
        <div className='w-80 h-60 flex flex-col  items-center justify-between shadow-sm shadow-gray-500 rounded-md overflow-hidden pt-2 '>
            <div className='relative w-full h-32 flex items-center justify-center '>
                {
                    imageProfileConect &&
                        <Image src='/icon/ONLINE.gif' width={100} height={100} alt='Icon-whatsapp' className='size-20 absolute bottom-0 '  />
                    
                }
                <Image src={imgIcon} width={100} height={100} alt='Icon-whatsapp ' className='size-32' />
                {imageProfileConect && <Image src={imageProfileConect} width={500} height={500} quality={100} alt='Icon-whatsapp' className='size-28 rounded-full shadow-md shadow-green-500 ' />}
            </div>
            <span className='font-bold text-lg text-black items-center justify-center flex w-full '>
                {title}
            </span>
            <span className=' font-extralight text-xs text-black text-center items-center justify-center flex w-full px-2 '>
                {descrição}
            </span>
            <button className={`p-2 ${buttonText === 'Conectar' ? 'bg-blue-500 text-white shadow-gray-600' : 'bg-green-500 text-black shadow-green-600 '}  w-full shadow uppercase font-bold  `} onClick={() => functionAction(title) }>
                {buttonText}
            </button>
        </div>
    )
}



