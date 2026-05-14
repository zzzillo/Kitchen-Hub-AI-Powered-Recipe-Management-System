import LoginBackground from '../components/LoginBackground'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoTitle from '../components/LogoTitle';
import LoginSignupForm from '../components/LoginSignupForm';
import type { AuthFormData } from '../components/LoginSignupForm';
import GoogleAuthButton from '../components/GoogleAuthButton';
import Message from '../components/Message';
import { useNavigate } from 'react-router-dom';
import AuthSideIllustration from "../assets/auth-side-illustration.jpg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface SignupResponse {
    success?: boolean;
    token?: string;
    message?: string;
    error?: string;
    user?: {
        username: string;
    };
}

const SignupPage = () => {
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const storedUser = localStorage.getItem("user"); 
    const token = localStorage.getItem("token"); 
    const navigate = useNavigate();

    useEffect (() => {
            if (storedUser && token) {
            navigate("/recipes");
            return;
        }
    }, [navigate, storedUser, token])

    const handleSignup = async (data: AuthFormData) => {
    if (isSubmitting) return;
    const username = data.username;
    const email = data.email;
    const password = data.password;

    try {
        setIsSubmitting(true);
        const response = await fetch(`${backendUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        let result: SignupResponse;
        try {
            result = await response.json();
        } catch {
            result = { message: "Invalid response from server" };
        }

        if (response.ok) {
            setMessageText(`${result.message || "Signup successful!"}`);
            setSignupSuccess(true);
        } else {
            setMessageText(`Signup failed: ${result.message || result.error || "Please try again."}`);
            setSignupSuccess(false);
        }
    } catch (_err) {
        setMessageText(" Network error. Please try again later.");
        setSignupSuccess(false);
    } finally {
        setIsSubmitting(false);
    }

    setShowMessage(true);
};

    const handleGoogleSignup = async (credential: string) => {
        if (isGoogleSubmitting) return;

        try {
            setIsGoogleSubmitting(true);
            const response = await fetch(`${backendUrl}/auth/google-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
            });

            const result = await response.json().catch(() => ({})) as SignupResponse;

            if (!response.ok || !result.success || !result.token || !result.user) {
                throw new Error(result.error || "Google signup failed.");
            }

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", result.user.username);
            navigate("/recipes");
        } catch (err) {
            setMessageText(err instanceof Error ? err.message : "Google signup failed. Please try again.");
            setSignupSuccess(false);
            setShowMessage(true);
        } finally {
            setIsGoogleSubmitting(false);
        }
    };


    const handleCloseMessage = () => {
        setShowMessage(false);
        if (signupSuccess) {
            navigate("/login");
        }
    };

    return (
        <div className='relative flex min-h-screen items-center justify-center overflow-hidden p-2.5'>
            <div className='absolute inset-0 -z-10 h-full w-full'>
                <LoginBackground/>
            </div>
            <div className='mx-auto w-full max-w-6xl'>
                <div className='mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[22px] bg-white shadow-[0_18px_48px_rgba(32,55,41,0.08)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500 lg:min-h-[44rem] lg:grid-cols-[0.92fr_1.08fr]'>
                    <div className='relative hidden overflow-hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-500 lg:flex'>
                        <img
                            src={AuthSideIllustration}
                            alt="Kitchen Hub book artwork"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(24,44,31,0.72),rgba(56,96,54,0.38),rgba(18,34,24,0.72))]" />
                        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                        <div className="space-y-5">
                            <h2 className="max-w-md font-['Fraunces'] text-6xl leading-none tracking-[-0.06em]">Start your own recipe collection and keep every dish in one place.</h2>
                            <p className="max-w-md text-base leading-8 text-white/78">
                                Sign up to create a new account and begin saving recipes, notes, and assistant-generated ideas.
                            </p>
                        </div>
                        </div>
                    </div>
                    <div className='flex min-h-full flex-col justify-center gap-8 px-5 py-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:px-8 lg:px-12'>
                        <LogoTitle/>
                        <div className='space-y-6'>
                            <LoginSignupForm buttonText='Signup' onSubmit={handleSignup} isSubmitting={isSubmitting} includeEmail />
                            <GoogleAuthButton onCredential={handleGoogleSignup} disabled={isGoogleSubmitting} text="signup_with" />
                        </div>
                        <div className='flex items-center justify-center gap-1 text-sm text-[#617466] sm:text-base'>
                            <p>Already have an account?</p>
                            <Link to='/login' className='font-semibold text-[#284734] underline decoration-white/40 underline-offset-4 transition hover:text-[#4f8e65]'>Login</Link>
                        </div>
                    </div>
                </div>
            </div>
            {showMessage && (
                <div className='fixed inset-0 z-20 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4'>
                    <Message message={messageText} onClose={handleCloseMessage}/>
                </div>
            )}
        </div>  
    )
};

export default SignupPage;
