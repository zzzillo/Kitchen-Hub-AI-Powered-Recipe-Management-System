import { Link, useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import LoginBackground from '../components/LoginBackground';
import LogoTitle from '../components/LogoTitle';
import LoginSignupForm from '../components/LoginSignupForm';
import Message from '../components/Message';

function LoginPage() {
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false); // track success or failure
    const storedUser = localStorage.getItem("user"); 
    const token = localStorage.getItem("token"); 

    useEffect (() => {
            if (storedUser && token) {
            navigate("/home");
            return;
        }
    },[])

    const handleLogin = async (data) => {
        const username = data.username;
        const password = data.password;

        try {
            const response = await fetch("http://localhost:3001/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem("token", result.token);
                localStorage.setItem("user", result.user.username);

                setMessageText("Login successful!");
                setLoginSuccess(true);   // mark success
                setShowMessage(true);
            } else {
                setMessageText(`Login failed: ${result.error || "Invalid credentials"}`);
                setLoginSuccess(false);
                setShowMessage(true);
            }
        } catch (err) {
            setMessageText("Network error. Please try again later.");
            setLoginSuccess(false);
            setShowMessage(true);
        }
    };

    const handleCloseMessage = () => {
        setShowMessage(false);
        if (loginSuccess) {
            navigate("/home"); // only go home if login was successful
        }
    };

    return (
        <div className='w-screen flex items-center justify-center'>
            <div className='absolute inset-0 w-full h-full object-cover -z-1'>
                <LoginBackground />
            </div>
            <div className='bg-semiwhite h-screen w-full rounded-xl opacity-90 shadow-xl shadow-stone-500 mt-0 lg:w-250 lg:h-170 lg:mt-10 transition-all duration-200'>
                <div className='flex items-center justify-center flex-col'>
                    <div className='w-full'>
                        <LogoTitle />
                    </div>
                    <LoginSignupForm buttonText='Login' onSubmit={handleLogin} />
                    <div className='mt-2 flex items-center flex-row gap-1'>
                        <p>Don't have an account?</p>
                        <Link to='/signup' className='text-green font-bold hover:text-green-800 focus:text-green-900 underline'>Sign Up</Link>
                    </div>
                </div>
            </div>
            {showMessage && (
                <div className='absolute z-10 top-50'>
                    <Message message={messageText} onClose={handleCloseMessage} />
                </div>
            )}
        </div>
    );
}

export default LoginPage;
