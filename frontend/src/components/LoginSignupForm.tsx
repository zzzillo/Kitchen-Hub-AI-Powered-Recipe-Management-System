import type { FormEvent } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface AuthFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

interface LoginSignupFormProps {
    buttonText: "Login" | "Signup";
    onSubmit: (formData: AuthFormData) => void;
    isSubmitting?: boolean;
    includeEmail?: boolean;
    identifierLabel?: string;
    identifierPlaceholder?: string;
}

const LoginSignupForm = ({
    buttonText,
    onSubmit,
    isSubmitting = false,
    includeEmail = false,
    identifierLabel,
    identifierPlaceholder,
}: LoginSignupFormProps) => {
    const isSignup = buttonText === "Signup";
    const loginLabel = identifierLabel || (isSignup ? "Username" : "Email or username");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = String(formData.get("username") || "");
        const email = includeEmail ? String(formData.get("email") || "") : "";
        const password = String(formData.get("password") || "");
        const confirmPassword = isSignup ? String(formData.get("confirmPassword") || "") : "";
        if (isSubmitting) return;

        if (isSignup && password !== confirmPassword) {
            setPasswordMismatch("Passwords do not match.");
            return;
        }

        setPasswordMismatch("");
        onSubmit({ username, email, password, confirmPassword });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className='mx-auto flex w-full max-w-xl flex-col gap-6'>
                <div className='grid gap-4'>
                    <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                        <span>{loginLabel}</span>
                        <input type='text' name='username' autoComplete={isSignup ? 'username' : 'username email'} maxLength={isSignup ? 32 : 120} minLength={isSignup ? 3 : undefined} required placeholder={identifierPlaceholder || (isSignup ? "Choose a username" : "Enter your email or username")} className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base' />
                    </label>
                    {includeEmail && (
                        <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                            <span>Email</span>
                            <input type='email' name='email' autoComplete='email' maxLength={120} required placeholder='Enter your email' className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base' />
                        </label>
                    )}
                    <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                        <span>Password</span>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} name='password' autoComplete={buttonText === "Login" ? "current-password" : "new-password"} minLength={isSignup ? 8 : undefined} maxLength={72} required placeholder={isSignup ? "Create a password" : "Enter your password"} className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 pr-12 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base' />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-[#617466] transition hover:bg-[#f7faf7] hover:text-[#284734]"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </label>
                    {isSignup && (
                        <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                            <span>Confirm password</span>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name='confirmPassword'
                                    autoComplete='new-password'
                                    minLength={8}
                                    maxLength={72}
                                    required
                                    placeholder='Enter your password again'
                                    onChange={() => {
                                        if (passwordMismatch) {
                                            setPasswordMismatch("");
                                        }
                                    }}
                                    className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 pr-12 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((current) => !current)}
                                    className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-[#617466] transition hover:bg-[#f7faf7] hover:text-[#284734]"
                                    aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </label>
                    )}
                    {passwordMismatch && (
                        <p className="text-sm font-medium text-[#b84f5b]">{passwordMismatch}</p>
                    )}
                </div>
                <div className='flex items-center justify-center pt-2'>
                    <button type='submit' disabled={isSubmitting} className='inline-flex min-w-52 items-center justify-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-[#4f8e65] sm:text-base'>
                        {isSubmitting ? `${buttonText}...` : buttonText}
                    </button>
                </div>
            </div>
        </form>
    )
};

export default LoginSignupForm;
