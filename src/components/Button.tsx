import Loadable from 'next/dist/shared/lib/loadable.shared-runtime';
import React, { useState , useEffect } from 'react';
import { Loading } from './Loading';
import { IconCircleDashedCheck, IconExclamationCircle } from '@tabler/icons-react';

export interface ICompleteActionsButtonProps {
    functionGet: () => void;
    msgUpdate: {status: string, message: string} | null;
    disabled: boolean ;
    text: string;
    msgAction?: boolean;
}

export const Button = ({functionGet, msgUpdate, disabled , text, msgAction = false}: ICompleteActionsButtonProps) => {
    console.log(msgUpdate)
    console.log(functionGet)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if(msgUpdate){
            setLoading(false)
        }
    }, [msgUpdate])


    const click = () => {
        functionGet();
        setLoading(true);
    }

    return (
        <div className='flex flex-col items-center justify-center '>
            <button 
                className={`w-auto min-w-40 h-10 flex items-center justify-center gap-5 shadow text-white shadow-gray-200 rounded-md  
                    ${!disabled  ? 'bg-blue-500' : 'bg-gray-500' } `} 
                    onClick={click} 
                    disabled={disabled}
            >
                {
                    !loading && msgUpdate?.status !== 'success' && msgUpdate?.status !== 'error' &&
                    <span className='m-2' > {text} </span>
                }
                {
                    loading || msgUpdate?.status === 'loading' &&
                    <div className="animate-spin rounded-full size-6 m-1 border-t-2 border-x-2 border-gray-200"></div>
                }
                {
                    msgUpdate?.status === 'success' &&
                    <span className='m-2 rounded-md text-green-500 size-full flex items-center justify-center '>
                        {msgUpdate?.status === 'success' && <IconCircleDashedCheck size={25} />}
                    </span> 
                }
                {
                    msgUpdate?.status === 'error' &&
                    <span className='m-2 rounded-md text-red-500 size-full flex items-center justify-center'>
                        {msgUpdate?.status === 'error' && <IconExclamationCircle size={25} />}
                    </span> 
                }
            </button>
            {
                msgAction &&
                <span className={`text-black text-sm ${msgUpdate?.status === 'success' ? 'text-green-500' : 'text-red-500' } `}>
                    {msgUpdate?.message} 
                </span>
            }
        </div>
    );
}
