import { useEffect, useRef } from "react";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleAuthButtonProps {
  onCredential: (credential: string) => void;
  text?: string;
  disabled?: boolean;
}

const GoogleAuthButton = ({
  onCredential,
  text = "continue_with",
  disabled = false,
}: GoogleAuthButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || !googleClientId || !containerRef.current) {
      return;
    }

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !containerRef.current) {
        return;
      }

      const wrapper = containerRef.current.querySelector<HTMLElement>("[data-google-button-slot]");
      if (!wrapper) {
        return;
      }

      wrapper.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response?.credential) {
            onCredential(response.credential);
          }
        },
      });

      window.google.accounts.id.renderButton(wrapper, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: Math.min(wrapper.offsetWidth || 320, 360),
        text,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [disabled, onCredential, text]);

  if (!googleClientId) {
    return (
      <div className="mx-auto w-full rounded-[0.95rem] border border-dashed border-[#d7e1d8] px-4 py-3 text-center text-sm text-[#617466] lg:max-w-[22.5rem]">
        Google login will appear after <code>VITE_GOOGLE_CLIENT_ID</code> is configured.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      <div data-google-button-slot className="min-h-11 w-full lg:max-w-[22.5rem]" />
    </div>
  );
};

export default GoogleAuthButton;
