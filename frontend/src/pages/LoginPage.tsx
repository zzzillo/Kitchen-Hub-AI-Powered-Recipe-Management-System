import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginBackground from '../components/LoginBackground';
import LogoTitle from '../components/LogoTitle';
import LoginSignupForm from '../components/LoginSignupForm';
import type { AuthFormData } from '../components/LoginSignupForm';
import GoogleAuthButton from '../components/GoogleAuthButton';
import Message from '../components/Message';
import AuthSideIllustration from "../assets/auth-side-illustration.jpg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface AuthResponse {
    success?: boolean;
    token?: string;
    error?: string;
    user?: {
        username: string;
    };
}

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false); // track success or failure
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const logoutMessage = typeof location.state === "object" && location.state && "message" in location.state
        ? String(location.state.message || "")
        : "";

    useEffect(() => {
        if (logoutMessage) {
            setMessageText(logoutMessage);
            setLoginSuccess(false);
            setShowMessage(true);
            navigate(location.pathname, { replace: true, state: null });
            return;
        }

        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            navigate("/recipes");
        }
    }, [location.pathname, logoutMessage, navigate]);

    const handleLogin = async (data: AuthFormData) => {
        if (isSubmitting) return;
        const username = data.username;
        const password = data.password;

        try {
            setIsSubmitting(true);
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json() as AuthResponse;

            if (response.ok && result.token && result.user) {
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
        } catch (_err) {
            setMessageText("Network error. Please try again later.");
            setLoginSuccess(false);
            setShowMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async (credential: string) => {
        if (isGoogleSubmitting) return;

        try {
            setIsGoogleSubmitting(true);
            const response = await fetch(`${backendUrl}/auth/google-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
            });

            const result = await response.json().catch(() => ({})) as AuthResponse;

            if (!response.ok || !result.success || !result.token || !result.user) {
                throw new Error(result.error || "Google login failed.");
            }

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", result.user.username);
            setMessageText("Login successful!");
            setLoginSuccess(true);
            setShowMessage(true);
        } catch (err) {
            setMessageText(err instanceof Error ? err.message : "Google login failed. Please try again.");
            setLoginSuccess(false);
            setShowMessage(true);
        } finally {
            setIsGoogleSubmitting(false);
        }
    };

    const handleCloseMessage = () => {
        setShowMessage(false);
        if (loginSuccess) {
            navigate("/recipes"); // only go home if login was successful
        }
    };

    return (
        <div className='relative flex min-h-screen items-center justify-center overflow-hidden p-2.5'>
            <div className='absolute inset-0 -z-10 h-full w-full'>
                <LoginBackground />
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
                            <h2 className="max-w-md font-['Fraunces'] text-6xl leading-none tracking-[-0.06em]">Keep your recipes, edits, and generated dishes in one system.</h2>
                            <p className="max-w-md text-base leading-8 text-white/78">
                                Log in to continue managing your saved recipes, ingredient lists, and notes.
                            </p>
                        </div>
                        </div>
                    </div>
                    <div className='flex min-h-full flex-col justify-center gap-8 px-5 py-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:px-8 lg:px-12'>
                        <LogoTitle />
                        <div className='space-y-6'>
                            <LoginSignupForm buttonText='Login' onSubmit={handleLogin} isSubmitting={isSubmitting} />
                            <GoogleAuthButton onCredential={handleGoogleLogin} disabled={isGoogleSubmitting} text="continue_with" />
                            <div className='text-center text-sm'>
                                <Link to='/reset-password' className='font-medium text-[#4f8e65] underline decoration-[#cdd8cf] underline-offset-4 transition hover:text-[#284734]'>
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>
                        <div className='flex items-center justify-center gap-1 text-sm text-[#617466] sm:text-base'>
                            <p>Don&apos;t have an account?</p>
                            <Link to='/signup' className='font-semibold text-[#284734] underline decoration-white/40 underline-offset-4 transition hover:text-[#4f8e65]'>Sign up</Link>
                        </div>
                    </div>
                </div>
            </div>
            {showMessage && (
                <Message
                    message={messageText}
                    onClose={handleCloseMessage}
                    autoCloseMs={loginSuccess ? 1000 : undefined}
                    showCloseButton={!loginSuccess}
                />
            )}
        </div>
    );
};

export default LoginPage;
