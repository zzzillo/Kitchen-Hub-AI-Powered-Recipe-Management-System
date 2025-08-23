import LoginBackground from '../components/LoginBackground'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LogoTitle from '../components/LogoTitle';
import LoginSignupForm from '../components/LoginSignupForm';
import Message from '../components/Message';

function SignupPage(){
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState("");
const handleSignup = async (data) => {
    const username = data.username;
    const password = data.password;

    try {
        const response = await fetch("http://localhost:3001/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        let result;
        try {
            result = await response.json();
        } catch {
            result = { message: "Invalid response from server" };
        }

        if (response.ok) {
            setMessageText(`✅ ${result.message || "Signup successful!"}`);
        } else {
            setMessageText(`❌ Signup failed: ${result.message || "Please try again."}`);
        }
    } catch (err) {
        console.error(err);
        setMessageText("❌ Network error. Please try again later.");
    }

    setShowMessage(true);
};


    const handleCloseMessage = () => {
        setShowMessage(false);
    };

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
                {showMessage && (<Message message={messageText} onClose={handleCloseMessage}/>)}
            </div>
        </div>  
    )
}

export default SignupPage;
