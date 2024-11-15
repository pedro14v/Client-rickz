import React from 'react';


interface CodeWidgetProps {
    id: string;
}

const CodeWidget = ({ id }: CodeWidgetProps) => {
    const handleCopy = () => {
        const codeToCopy = `<iframe
            src="http://localhost:3000/widget/${id}"
            style={{width: '20dvw', height: '75dvh', position: 'fixed', bottom: 5, right: 5, zIndex: 9999,boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'}}
            ></iframe>`;
        navigator.clipboard.writeText(codeToCopy);
    };

    return (
        <div className="dark bg-gray-950 rounded-md border-[0.5px] border-token-border-medium text-white overflow-auto ">
            <div className="flex items-center relative px-4 py-2 text-xs font-sans justify-between rounded-t-md border-b-2 border-white ">
                <span>html</span>
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
                    Copiar código
                    </button>
                </span>
                </div>
            </div>
            <div className="overflow-y-auto p-4" dir="ltr">
                <code className="!whitespace-pre hljs language-html">
                &lt;<span className="hljs-name">iframe</span>
                <br />
                &nbsp;&nbsp;<span className="hljs-attr">src</span>=
                <span className="hljs-string">
                &quot;http://localhost:3000/widget/{id}?token=<b className='text-lg uppercase'>seu-token</b>&quot;
                </span>
                <br />
                &nbsp;&nbsp;<span className="hljs-attr">style</span>=
                <span className="hljs-string">{`{{width: '20dvw', height: '75dvh', position: 'fixed', bottom: 5, right: 5, zIndex: 9999,boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'}}`}</span>
                <br />
                &gt;&lt;/<span className="hljs-name">iframe</span>&gt;
                </code>

            </div>
        </div>
    );
};

export default CodeWidget;
