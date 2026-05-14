import loginBg from '../assets/background.jpg'

const LoginBackground = () => {
    return (
        <div className='relative h-full w-full overflow-hidden'>
            <img
              src={loginBg}
              alt='Kitchen background'
              className='h-full w-full object-cover scale-105 blur-[1px] transition-transform duration-[1400ms] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95'
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_30%),linear-gradient(135deg,rgba(23,47,35,0.5),rgba(98,149,117,0.22),rgba(244,249,245,0.42))]" />
        </div>

    )
};

export default LoginBackground;
