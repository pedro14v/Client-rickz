


export const Loading = ({isResponsive = false}: {isResponsive?: boolean}) => {
  return (
    <>
      <div className={`flex items-center justify-center ${isResponsive ? 'h-full w-full' : 'h-auto w-auto' }  m-auto `}>
        <div className={`animate-spin rounded-full ${isResponsive ? 'h-full w-full' : 'h-32 w-32' }  border-t-2 border-b-2 border-blue-500`}></div>
      </div>
    </>
  );
}
