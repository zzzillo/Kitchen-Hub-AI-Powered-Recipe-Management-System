import loginBg from '../assets/background.jpg'

function LoginBackground() {
    return (
        <div className='h-screen w-full'>
            <img src={loginBg} alt='Login Background'className='h-full w-full object-cover blur-vm'/>
        </div>

    )
}

export default LoginBackground;