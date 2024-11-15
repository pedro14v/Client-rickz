import { IconEye, IconEyeOff } from '@tabler/icons-react';
import React from 'react';


interface TokenWidgetProps {
    token: string;
}

const TokenWidget = ({ token }: TokenWidgetProps) => {
    const [hidden, setHidden] = React.useState(true);
    const handleCopy = () => {
        const codeToCopy = token;
        navigator.clipboard.writeText(codeToCopy);
    };

    return (
        <div className="dark bg-gray-950 rounded-md border-[0.5px] border-token-border-medium text-white overflow-auto ">
            <div className="flex items-center relative px-4 py-2 text-xs font-sans justify-between rounded-t-md border-b-2 border-white ">
                <span>Token</span>
                <div className="flex items-center">
                <span>
                    <button onClick={handleCopy} className="flex gap-1 items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="icon-sm"
                    >
                        <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z"
                        clipRule="evenodd"
                        ></path>
                    </svg>
                    Copiar token
                    </button>
                </span>
                </div>
            </div>
            <div className="overflow-y-auto p-4 relative flex items-center" dir="ltr">
                <code className={`px-10`} > 
                    {hidden ? String(token)[0]+'*****************************'+String(token)[String(token).length - 1] : token}
                </code>
                
                <button className={`absolute right-0 h-full w-[5%] rounded-full cursor-pointer bg-gradient-to-r from-transparent to-black`} onClick={() => setHidden(!hidden)}>
                    {hidden ? 
                        <IconEye size={20} stroke={2} className='text-white' />
                    : 
                        <IconEyeOff size={20} stroke={2} className='text-white' />
                    }
                </button>
            </div>
        </div>
    );
};

export default TokenWidget;
