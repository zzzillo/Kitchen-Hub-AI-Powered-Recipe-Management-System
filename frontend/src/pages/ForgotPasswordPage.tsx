import { Link } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import LoginBackground from "../components/LoginBackground";
import LogoTitle from "../components/LogoTitle";
import Message from "../components/Message";
import AuthSideIllustration from "../assets/auth-side-illustration.jpg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const handleRequestCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${backendUrl}/auth/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json().catch(() => ({}));
      setMessageText(result.message || result.error || "Unable to send reset code right now.");
    } catch (_err) {
      setMessageText("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
      setShowMessage(true);
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
                <h2 className="max-w-md font-['Fraunces'] text-6xl leading-none tracking-[-0.06em]">Get a reset code and set a new password.</h2>
                <p className="max-w-md text-base leading-8 text-white/78">
                  Enter the email linked to your Kitchen Hub account and we&apos;ll send a code you can use on the next screen.
                </p>
              </div>
            </div>
          </div>
          <div className='flex min-h-full flex-col justify-center gap-8 px-5 py-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:px-8 lg:px-12'>
            <LogoTitle />
            <form onSubmit={handleRequestCode} className="w-full">
              <div className='mx-auto flex w-full max-w-xl flex-col gap-6'>
                <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base'
                  />
                </label>
                <button type='submit' disabled={isSubmitting} className='inline-flex min-w-52 items-center justify-center self-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-[#4f8e65] sm:text-base'>
                  {isSubmitting ? "Sending code..." : "Send reset code"}
                </button>
              </div>
            </form>
            <div className='space-y-3 text-center text-sm text-[#617466] sm:text-base'>
              <div className='flex flex-wrap items-center justify-center gap-1'>
                <p>Already have a code?</p>
                <Link to='/reset-password' className='font-semibold text-[#284734] underline decoration-white/40 underline-offset-4 transition hover:text-[#4f8e65]'>Reset password</Link>
              </div>
              <div>
                <Link to='/login' className='font-semibold text-[#284734] underline decoration-white/40 underline-offset-4 transition hover:text-[#4f8e65]'>Back to login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMessage && (
        <div className='fixed inset-0 z-20 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4'>
          <Message message={messageText} onClose={() => setShowMessage(false)} />
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
