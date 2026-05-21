import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import LoginBackground from "../components/LoginBackground";
import LogoTitle from "../components/LogoTitle";
import Message from "../components/Message";
import AuthSideIllustration from "../assets/auth-side-illustration.jpg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface PasswordResetResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const trimmedCode = useMemo(() => code.trim(), [code]);

  const showPasswordField = codeVerified;

  const openMessage = (text: string, success = false) => {
    setMessageText(text);
    setResetSuccess(success);
    setShowMessage(true);
  };

  const handleSendCode = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSendingCode || !trimmedEmail) return;

    try {
      setIsSendingCode(true);
      const response = await fetch(`${backendUrl}/auth/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const result = await response.json().catch(() => ({})) as PasswordResetResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to send reset code right now.");
      }

      setCodeSent(true);
      setCodeVerified(false);
      setNewPassword("");
      openMessage(result.message || "Reset code sent. Check your email.");
    } catch (err) {
      openMessage(err instanceof Error ? err.message : "Unable to send reset code right now.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isVerifyingCode || !trimmedEmail || !trimmedCode) return;

    try {
      setIsVerifyingCode(true);
      const response = await fetch(`${backendUrl}/auth/password-reset/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, code: trimmedCode }),
      });

      const result = await response.json().catch(() => ({})) as PasswordResetResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to verify reset code right now.");
      }

      setCodeVerified(true);
      openMessage(result.message || "Code verified.");
    } catch (err) {
      setCodeVerified(false);
      openMessage(err instanceof Error ? err.message : "Unable to verify reset code right now.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResetPassword = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isResetting || !codeVerified) return;

    try {
      setIsResetting(true);
      const response = await fetch(`${backendUrl}/auth/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, code: trimmedCode, newPassword }),
      });

      const result = await response.json().catch(() => ({})) as PasswordResetResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to reset password right now.");
      }

      openMessage(result.message || "Password has been reset.", true);
    } catch (err) {
      openMessage(err instanceof Error ? err.message : "Unable to reset password right now.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (codeSent || codeVerified) {
      setCodeSent(false);
      setCodeVerified(false);
      setCode("");
      setNewPassword("");
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
    if (codeVerified) {
      setCodeVerified(false);
      setNewPassword("");
    }
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
    if (resetSuccess) {
      navigate("/login");
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
                <h2 className="max-w-md font-['Fraunces'] text-6xl leading-none tracking-[-0.06em]">Send a code, verify it, then choose a new password.</h2>
                <p className="max-w-md text-base leading-8 text-white/78">
                  Enter your email first, verify the 6-digit code you receive, and we&apos;ll reveal the password field right below it.
                </p>
              </div>
            </div>
          </div>
          <div className='flex min-h-full flex-col justify-center gap-8 px-5 py-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:px-8 lg:px-12'>
            <LogoTitle />
            <div className="w-full">
              <div className='mx-auto flex w-full max-w-xl flex-col gap-5'>
                <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter your email"
                    className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base'
                  />
                </label>

                <button
                  type='button'
                  onClick={handleSendCode}
                  disabled={isSendingCode || !trimmedEmail}
                  className='inline-flex min-w-52 items-center justify-center self-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-[#4f8e65] sm:text-base'
                >
                  {isSendingCode ? "Sending code..." : codeSent ? "Send code again" : "Send reset code"}
                </button>

                <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                  <span>Reset code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="Enter the 6-digit code"
                    className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 text-sm tracking-[0.3em] text-slate-800 outline-none transition duration-150 placeholder:tracking-normal placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base'
                  />
                </label>

                <button
                  type='button'
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || !trimmedEmail || trimmedCode.length !== 6}
                  className='inline-flex min-w-52 items-center justify-center self-center rounded-[0.95rem] border border-[#d7e1d8] bg-white px-[1.15rem] py-[0.72rem] text-sm font-semibold text-[#284734] transition duration-200 hover:-translate-y-px hover:bg-[#f7faf7] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-white sm:text-base'
                >
                  {isVerifyingCode ? "Verifying..." : codeVerified ? "Code verified" : "Verify code"}
                </button>

                {showPasswordField && (
                  <>
                    <label className="grid gap-2 text-sm font-semibold text-[#284734] sm:text-base">
                      <span>New password</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className='h-13 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:h-14 sm:text-base'
                      />
                    </label>

                    <button
                      type='button'
                      onClick={handleResetPassword}
                      disabled={isResetting || newPassword.length < 8}
                      className='inline-flex min-w-52 items-center justify-center self-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-[#4f8e65] sm:text-base'
                    >
                      {isResetting ? "Resetting..." : "Reset password"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className='text-center text-sm text-[#617466] sm:text-base'>
              <Link to='/login' className='font-semibold text-[#284734] underline decoration-white/40 underline-offset-4 transition hover:text-[#4f8e65]'>Back to login</Link>
            </div>
          </div>
        </div>
      </div>
      {showMessage && (
        <Message message={messageText} onClose={handleCloseMessage} />
      )}
    </div>
  );
};

export default ResetPasswordPage;
