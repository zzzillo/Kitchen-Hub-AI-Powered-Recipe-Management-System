
function Message({message, onClose}) {
    return (
        <div className='w-100 h-40 bg-white rounded-xl opacity-90 p-4 flex items-center flex-col'>
            <div className='h-25 overflow-auto'>
                <p className='text-md break-words'>{message}</p>
            </div>
            <button onClick={onClose} className='h-10 w-40 text-md bg-green text-white rounded-md hover:bg-green-800 hover:scale-105 active:bg-green-900 active:scale-95 focus:outline-none focus:ring-2 focus:outline-0 shadow-none transition-all duration-200'>Okay</button>
        </div>
    )
}

export default Message;