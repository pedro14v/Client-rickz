'use client'
import * as React from 'react';
import { IconBrandGoogle, IconBrandFacebook, IconBrandTiktok, IconSquareRoundedXFilled, IconCircleDashedCheck, IconLoader } from '@tabler/icons-react';
import { signIn } from "next-auth/react"
import { FieldError, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z, { set } from 'zod';
import Image from 'next/image';
import { watch } from 'fs';
import { createUser } from '@/functions/createUser';
import { useRouter } from 'next/navigation';

export interface IAuthProps {}

const schemaLogin = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

const schemaRegistro = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    nameBusiness: z.string().optional(), // Tornando opcional inicialmente
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').max(16, 'A senha deve ter no máximo 16 caracteres'),
    confirmPassword: z.string(),
    whatsapp: z.string().optional(),
    membroToken: z.string().optional()
}).passthrough()
.refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
})
.refine(data => {
    // Se membroToken não existir, nameBusiness é obrigatório
    if (!data.membroToken && !data.nameBusiness) {
        return false;
    }
    return true;
}, {
    message: "Nome da empresa é obrigatório",
    path: ["nameBusiness"]
});



export default function Auth(props: IAuthProps) {
    const router = useRouter();
    const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin } } = useForm({
        resolver: zodResolver(schemaLogin)
    });
    const { register: registerRegistro, handleSubmit: handleSubmitRegistro, formState: { errors: errorsRegistro }, watch: watchRegistro } = useForm({
        resolver: zodResolver(schemaRegistro)
    });
    const [section, setSection] = React.useState('login');
    const [loadCreate, setLoadCreate] = React.useState<{ status: 'none' | 'loading' | 'success' | 'error', text: string }>({ status: 'none', text: 'Registrar' });
    const [loadLogin, setLoadLogin] = React.useState<{ status: 'none' | 'loading' | 'success' | 'error', text: string }>({ status: 'none', text: 'Entrar' });
    const onSubmitLogin = async (data: any) => {
        console.log(data);
        setLoadLogin({ status: 'loading', text: 'Entrando...' });
        const login = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false
        })
        if(login?.error) {
            setLoadLogin({ status: 'error', text: 'Credenciais inválidas' });
        }

        setTimeout(() => {
            setLoadLogin({ status: 'none', text: 'Entrar' });
            if(!login?.error) {
                window.location.href = '/';
            }
        }, 3000);
    };

    const onSubmitRegistro = async (data: any) => {
        setLoadCreate({ status: 'loading', text: 'Registrando...' });
        const create = await createUser(data);
        console.log(create);

        setLoadCreate({ status: create.status === 'error' ? 'error' : 'success', text: create.message });

        setTimeout(() => {
            setLoadCreate({ status: 'none', text: 'Registrar' });
            if(create.status === 'success') {
                setSection('login');
            }
        }, 3000);
    };
    console.log(watchRegistro('password'));

    return (
        <main className="flex w-screen min-h-screen bg-[var(--bg-start)]">
            <section className='flex justify-center items-center h-screen w-full max-w-screen-2xl m-auto py-10'>
                
                {/* Login Section */}
                <div className={`relative ${section === 'login' ? 'w-1/2' : 'w-0 border-none'} overflow-hidden transition-default h-full flex flex-col items-center justify-center border-l-[1px] border-gray-400 py-20`}>
                    <span className='text-xs font-bold text-black absolute top-5 left-5 min-w-[15rem]'>
                        Não tem uma conta? <span className='text-blue-500 font-bold cursor-pointer' onClick={() => setSection('registro')}>Registre-se</span>
                    </span>
                    <span className='text-4xl font-bold text-black'>Entrar</span>
                    <form className='flex flex-col items-center justify-center min-w-[40rem]' id='formEntrar' onSubmit={handleSubmitLogin(onSubmitLogin)}>
                        <Input type='email' placeholder='Email' register={registerLogin} name='email' error={errorsLogin.email?.message} />
                        <Input type='password' placeholder='Senha' register={registerLogin} name='password' error={errorsLogin.password?.message} />
                        <Button text='Entrar' loading={{ status: loadLogin.status, text: loadLogin.text }} />
                    </form>
                    <div className='min-w-[40rem] flex items-center justify-between gap-1'>
                        <hr className='w-full border-gray-400 h-[1px] bg-black' />
                        <span className='text-gray-500 font-bold'>OU</span>
                        <hr className='w-full border-gray-400 h-[1px] bg-black' />
                    </div>
                    <button className='relative min-w-[15rem] p-2 m-2 rounded-md bg-red-500 text-white flex items-center justify-center gap-2 mt-10 ' onClick={() => signIn('google')}>
                        <IconBrandGoogle size={24} stroke={1} className='absolute left-[-10px] top-[-10px] text-black size-8 bg-[--bg-start] rounded-xl '/>
                        <span>Entrar com Google</span>
                    </button>
                </div>
                
                {/* Informational Section */}
                <div className={`w-1/2 h-full flex flex-col items-center justify-between ${section === 'login' ? 'border-l-[1px]' : 'border-r-[1px]'} transition-default border-y-[1px] border-gray-400 rounded-3xl py-10 px-5`}>
                    <Image src={'/logo.png'} width={150} height={150} alt='Logo' />
                    <span className='text-4xl text-black w-full text-center px-5 font-semibold'>Bem vindo ao RICKZ.AI</span>
                    <span className='text-sm text-black w-full text-start px-5'>Com RICKZ.AI, você pode criar e personalizar chatbots para atender às necessidades dos seus clientes, impulsionar vendas ou até mesmo para seu uso pessoal.</span>
                    <Image src={'/imgAuth.png'} width={500} height={500} alt='Auth Image' />
                </div>
          
                {/* Registration Section */}
                <div className={`relative ${section === 'registro' ? 'w-1/2' : 'w-0 border-none'} overflow-hidden transition-default h-full flex flex-col items-center justify-center border-r-[1px] border-gray-400 py-20`}>
                    <span className='text-xs font-bold text-black absolute top-5 left-5 min-w-[40rem]'>
                        Já tem uma conta? <span className='text-blue-500 font-bold cursor-pointer' onClick={() => setSection('login')}>Entrar</span>
                    </span>
                    <span className='text-4xl font-bold text-black'>Registre-se</span>
                    <form className='flex flex-col items-center justify-center w-full min-w-[40rem] gap-2 mt-2 ' id='formRegistrar' onSubmit={handleSubmitRegistro(onSubmitRegistro)}>
                        <Input type='text' placeholder='Membro token' register={registerRegistro} name='membroToken' error={errorsRegistro.membroToken?.message || null} />
                        <Input type='text' placeholder='Nome' register={registerRegistro} name='name' error={errorsRegistro.name?.message || null} />
                        {
                            !watchRegistro('membroToken') && <Input type='text' placeholder='Nome da empresa' register={registerRegistro} name='nameBusiness' error={errorsRegistro.nameBusiness?.message || null} />
                        }
                        <Input type='email' placeholder='Email' register={registerRegistro} name='email' error={errorsRegistro.email?.message || null} />
                        <Input type='text' placeholder='Whatsapp' register={registerRegistro} name='whatsapp' error={errorsRegistro.whatsapp?.message || null} />
                        <Input type='password' placeholder='Senha' register={registerRegistro} name='password' error={errorsRegistro.password?.message || null} />
                        <Input type='password' placeholder='Confirmar Senha' register={registerRegistro} name='confirmPassword' error={errorsRegistro.confirmPassword?.message || null} />
                        <div className='flex flex-col items-start justify-center gap-2'>
                            
                            <span className={`font-bold flex items-center gap-2 px-8 text-xs ${String(watchRegistro('password')).length < 6 || !watchRegistro('password') ? 'text-red-600' : 'text-green-500'}`}>
                                {
                                    String(watchRegistro('password')).length < 6 || !watchRegistro('password') ? <IconSquareRoundedXFilled size={16} stroke={1} className='text-red-600' /> : <IconCircleDashedCheck size={16} stroke={1} className='text-green-500' />
                                }
                                Senha deve ter no mínimo 6 caracteres
                            </span>
                            <span className={`font-bold px-8 flex items-center gap-2 text-xs ${String(watchRegistro('password')).length > 16 || !watchRegistro('password') ? 'text-red-600' : 'text-green-500'}`}>
                                {
                                    String(watchRegistro('password')).length > 16 || !watchRegistro('password') ? <IconSquareRoundedXFilled size={16} stroke={1} className='text-red-600' /> : <IconCircleDashedCheck size={16} stroke={1} className='text-green-500' />
                                }
                                Senha deve ter no máximo 16 caracteres
                            </span>
                            <span className={`font-bold px-8 flex items-center gap-2 text-xs ${watchRegistro('password') === watchRegistro('confirmPassword') && watchRegistro('password') ? 'text-green-500' : 'text-red-600'}`}>
                                {
                                    watchRegistro('password') === watchRegistro('confirmPassword') && watchRegistro('password') ? <IconCircleDashedCheck size={16} stroke={1} className='text-green-500' /> : <IconSquareRoundedXFilled size={16} stroke={1} className='text-red-600' />
                                }
                                As senhas devem coincidir
                            </span>
                        </div>
                        

                        <Button text='Registrar' loading={{ status: loadCreate.status, text: loadCreate.text }} />
                    </form>
                </div>

            </section>
        </main>
    );
}

// Input Component
const Input = ({ type, placeholder, register, name, error }: { type: string, placeholder: string, register: any, name: string, error?: any  }) => {
    return (
        <span className='min-w-[25rem] flex items-center justify-center gap-2 relative'>
            <input type={type} placeholder={placeholder} className={`w-full p-2 m-2 rounded-md border  shadow shadow-gray-600 ${error ? 'border-red-500' : 'border-gray-400' } `} {...register(name)} />
            {error && <span className='text-red-600 font-bold text-xs absolute -top-2 left-2 bg-white w-full border-l-2 border-red-500 pl-5 '>{typeof error === 'string' ? error : error.message}</span>}
        </span>
    );
};

// Button Component
const Button = ({ text, loading }: { text: string, loading: { status: 'none' | 'loading' | 'success' | 'error', text: string } }) => {
    return (
        <button type='submit' className='min-w-[15rem] p-2 m-2 rounded-md bg-blue-500 text-white'>
            {loading.status !== 'none' ?
                <span className={`flex items-center justify-center gap-2 animate-pulse ${loading.status === 'loading' ? 'text-gray-800' : 'text-black'} ${loading.status === 'success' && 'text-green-500'} ${loading.status === 'error' && 'text-red-600'}`}>
                    {
                        loading.status === 'success' && <IconCircleDashedCheck size={24} stroke={1} className='text-green-500' />
                    }
                    {
                        loading.status === 'error' && <IconCircleDashedCheck size={24} stroke={1} className='text-red-600' />
                    }
                    {
                        loading.status === 'loading' && <IconLoader size={24} stroke={1} className='animate-spin ' />
                    }
                    {loading.text}
                </span> 
                : 
                <span>{text}</span>
            }
        </button>
    );
};
