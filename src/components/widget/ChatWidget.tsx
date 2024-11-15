'use client'
import { IconMessage, IconSquareLetterXFilled } from "@tabler/icons-react";
import React, { use, useEffect, useRef, useState } from "react";
import { gerarThread } from "@/functions/openai/IA/gerarThread";
import { put_getMensagem } from "@/functions/openai/put_getMensagem";
import { getAssistenteAuthToken } from "@/functions/assistentes/getAssistente";
import { set } from "zod";

interface ChatWidgetProps {
  authToken: string;
  assistenteId?: any;
}

interface Message {
  text: string;
  sender: "user" | "bot";
}

const messages: Message[] = [
  { text: "Olá, eu sou um bot, como posso te ajudar?", sender: "bot" },
];

const ChatWidget: React.FC<ChatWidgetProps> = ({ authToken, assistenteId }) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [thread, setThread] = useState<string>('')
  const [assistente, setAssistente] = useState<any>(null)
  const [sendLoading, setSendLoading] = useState<boolean>(false)
  const containerRef = useRef(null);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    setSendLoading(true)

    const newMessage: Message = { text: inputMessage, sender: "user" };
    messages.push(newMessage);

    try {
      const response = await put_getMensagem({
        msg: inputMessage,
        threadUser: thread,
        assistantId: assistente.assistenteIdGPT
      });
      console.log(response)

      if(response.length === 0) {
        messages.push({ text: "Não entendi o que você quis dizer", sender: "bot" });
        setInputMessage("");
        setSendLoading(false)
        return
      }

      response.map((res: any) => {
        messages.push({ text: res, sender: "bot" });
      })

      setSendLoading(false)
      scrollIntoView();
    } catch (error) {
      messages.push({ text: "Erro de conexão", sender: "bot" });
      setSendLoading(false)
      scrollIntoView();
    }

    setInputMessage("");
  };

  useEffect(() => {
    if(isOpen && thread === ''){
      gerarThread().then((res) => {
        setThread(res)
      })
    }
  }, [isOpen, inputMessage]);


  useEffect(() => {
    (async () => {
      if(authToken) {
        const response = await getAssistenteAuthToken({authToken: authToken}) as any;
        console.log(response)
        setAssistente(response)
      }
    })()
  }, [authToken])

  const scrollIntoView = () => {
    const conteinerMsg = containerRef.current as any;
    if (conteinerMsg) {
        conteinerMsg.scrollTop = conteinerMsg.scrollHeight;
    }
  };


  if(!assistente) return <></>



  return (
    
      <div className={`chat-widget flex flex-col z-50 fixed bottom-0 right-0  rounded-md overflow-hidden  transition-default2 ${isOpen ? 'w-full h-full border border-black' : 'w-16 h-16'}`}>
        
        {
            isOpen ?
            <>
                <div className="chat-header p-4 bg-gray-300 relative">
                <h1 className="text-xl text-center">Chat</h1>
                <button onClick={() => setIsOpen(!isOpen)} className="size-auto mt-2 text-white rounded absolute top-1 right-2">
                    <IconSquareLetterXFilled size={24} stroke={2} className="text-blue-500 size-full" />
                </button>
                </div>
                <div className="chat-messages flex-1 overflow-y-scroll p-4 bg-gray-100 " ref={containerRef}>
                  {messages.map((msg, index) => (
                      <div
                      key={index}
                      className={`my-2 p-2 max-w-xs rounded ${
                          msg.sender === "user"
                          ? "bg-blue-500 text-white self-end"
                          : "bg-white text-black self-start"
                      }`}
                      >
                      {msg.text}
                      </div>
                  ))}
                </div>
                <div className="chat-input flex p-4 bg-gray-200">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 p-2 rounded border border-gray-300"
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    {sendLoading ? 'Enviando...' : 'Enviar'}
                </button>
                </div>            
            </>
            :
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full h-full flex items-center justify-center text-white rounded ${
                isOpen ? "rounded-b-none" : ""
              }`}
            >
              <IconMessage size={50} stroke={2} className="text-blue-500" />
            </button>

        }
        
      </div>
  );
};

export default ChatWidget;
