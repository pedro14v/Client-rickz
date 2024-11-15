export const Titles = ({title , subtitle} : {title: string , subtitle: string}) => {

    return(
        <div className='w-full flex flex-col h-auto  items-start justify-center border-b border-gray-600 py-2 '>
            <span className='font-bold text-black rounded-full items-center justify-center flex text-xl '>
                {title}
            </span>
            <span className='font-extralight text-black rounded-full items-center justify-center flex text-xs '>
                {subtitle}
            </span>
        </div>
    )
}