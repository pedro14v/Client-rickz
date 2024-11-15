import React from 'react';

export interface IPopupProps {
  functionReturn: () => void
  title : string
  description: string
  close: () => void
  status: boolean
  button: string
}

export default function Popup ({functionReturn, title, description, close, status, button}: IPopupProps){
  console.log(status)
  return (
    <dialog className={ `absolute bottom-0 left-0 w-screen bg-black flex items-center justify-center bg-opacity-30 z-50 transition-default overflow-hidden ${status ? 'h-screen' : 'h-0' } `}  open={status}>
      <div className='size-full absolute top-0 -z-30 backdrop-blur-md' />


      <div className='w-full max-w-7xl h-96 bg-white m-auto rounded-md shadow shadow-gray-600'>
        <div className='flex items-center justify-between w-full h-12 bg-gray-600 rounded-t-md px-5 '>
          <span className='text-white font-bold'>{title}</span>
          <button className='p-2 text-white' onClick={close}>X</button>
        </div>
        <div className='p-2 flex flex-col gap-10'>
          <p className='text-xl' >{description}</p>
          <div className='flex items-center justify-start gap-5'>
            <button className='p-2 bg-[--azul] text-white rounded-md shadow shadow-gray-600'onClick={functionReturn} >{button}</button>
            <button className='p-2 bg-gray-600 text-white rounded-md shadow shadow-gray-600' onClick={close}>Cancelar</button>
          </div>
        </div>
      </div>
      
    </dialog>
  );
}
