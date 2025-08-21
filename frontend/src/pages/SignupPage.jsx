import LoginBackground from '../components/LoginBackground'
import {Link} from 'react-router-dom';
import { useState } from 'react';
import LogoTitle from '../components/LogoTitle';
import LoginSignupForm from '../components/LoginSignupForm';
import Message from '../components/Message';
function SignupPage(){
            
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSignup = (data) => {
        const username = data.username;
        const password = data.password;
        console.log(`Username: ${username}, Password: ${password}`);
        setShowSuccess(true);
    }

    const handleCloseSuccess = () => {
        setShowSuccess(false);
    }


    return (
        <div className=' w-screen flex items-center justify-center'>
            <div className='absolute inset-0 w-full h-full object-cover -z-1'>
                <LoginBackground/>
            </div>
            <div className='bg-semiwhite h-screen w-full rounded-xl opacity-90 shadow-xl shadow-stone-500 mt-0 lg:w-250 lg:h-170 lg:mt-10 transition-all duration-200'>
                <div className='flex items-center justify-center flex-col'>
                    <div className='w-full'>
                        <LogoTitle/>
                    </div>
                    <LoginSignupForm buttonText='Signup' onSubmit={handleSignup}></LoginSignupForm>
                    <div className='mt-2 flex items-center flex-row gap-1'>
                        <p>Already have an account?</p>
                        <Link to='/' className='text-green font-bold hover:text:green-800 focus:text-green-900 underline'>Login</Link>
                    </div>
                </div>
            </div>
            <div className='absolute z-1 top-50'>
                {showSuccess && (<Message message="Signup successful!" onClose={handleCloseSuccess}/>)}
            </div>
        </div>  
    )
}

export default SignupPage;