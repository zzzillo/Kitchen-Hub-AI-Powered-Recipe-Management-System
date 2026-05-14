
interface MessageProps {
    message: string;
    onClose: () => void;
}

const Message = ({ message, onClose }: MessageProps) => {
    return (
        <div className='relative flex w-[min(26rem,92vw)] flex-col items-center gap-5 overflow-hidden rounded-[24px] border border-white/35 bg-[linear-gradient(160deg,rgba(255,255,255,0.3),rgba(236,243,233,0.18))] p-5 shadow-[0_20px_52px_rgba(23,37,22,0.2),inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-[18px] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300 sm:p-6'>
            <div className='max-h-40 overflow-auto'>
                <p className='text-center text-sm leading-7 break-words sm:text-base'>{message}</p>
            </div>
            <button onClick={onClose} className='inline-flex min-w-36 items-center justify-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] sm:text-base'>Okay</button>
        </div>
    )
};

export default Message;
