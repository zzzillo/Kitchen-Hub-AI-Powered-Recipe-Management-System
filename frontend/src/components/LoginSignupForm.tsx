import type { FormEvent } from "react";

export interface AuthFormData {
    username: string;
    email: string;
    password: string;
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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = String(formData.get("username") || "");
        const email = includeEmail ? String(formData.get("email") || "") : "";
        const password = String(formData.get("password") || "");
        if (isSubmitting) return;
        onSubmit({ username, email, password });
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
                        <input type='password' name='password' autoComplete={buttonText === "Login" ? "current-password" : "new-password"} minLength={isSignup ? 8 : undefined} maxLength={72} required placeholder={isSignup ? "Create a password" : "Enter your password"} className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base' />
                    </label>
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
