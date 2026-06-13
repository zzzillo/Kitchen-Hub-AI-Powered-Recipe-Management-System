import { useEffect, useRef, useState } from "react";

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
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (disabled || !googleClientId || !containerRef.current) {
      return;
    }

    let cancelled = false;
    let lastRenderedWidth = 0;
    let resizeFrame = 0;
    let revealTimeout = 0;
    let resizeObserver: ResizeObserver | null = null;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !containerRef.current) {
        return;
      }

      const wrapper = containerRef.current.querySelector<HTMLElement>("[data-google-button-slot]");
      if (!wrapper) {
        return;
      }

      const nextWidth = Math.min(wrapper.offsetWidth || 320, 360);
      if (nextWidth === lastRenderedWidth && wrapper.childElementCount > 0) {
        return;
      }

      lastRenderedWidth = nextWidth;
      setIsRendered(false);

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
        width: nextWidth,
        text,
      });

      if (revealTimeout) {
        window.clearTimeout(revealTimeout);
      }

      revealTimeout = window.setTimeout(() => {
        if (!cancelled) {
          setIsRendered(true);
        }
      }, 120);
    };

    const watchWrapperSize = () => {
      if (!containerRef.current || resizeObserver) {
        return;
      }

      const wrapper = containerRef.current.querySelector<HTMLElement>("[data-google-button-slot]");
      if (!wrapper) {
        return;
      }

      resizeObserver = new ResizeObserver(() => {
        if (resizeFrame) {
          cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = requestAnimationFrame(renderGoogleButton);
      });

      resizeObserver.observe(wrapper);
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      watchWrapperSize();
      return () => {
        cancelled = true;
        if (resizeFrame) {
          cancelAnimationFrame(resizeFrame);
        }
        if (revealTimeout) {
          window.clearTimeout(revealTimeout);
        }
        resizeObserver?.disconnect();
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderGoogleButton();
      watchWrapperSize();
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }
      if (revealTimeout) {
        window.clearTimeout(revealTimeout);
      }
      resizeObserver?.disconnect();
    };
  }, [disabled, onCredential, text]);

  if (!googleClientId) {
    return (
      <div className="mx-auto w-full max-w-[22.5rem] rounded-[0.95rem] border border-dashed border-[#d7e1d8] px-4 py-3 text-center text-sm text-[#617466]">
        Google login will appear after <code>VITE_GOOGLE_CLIENT_ID</code> is configured.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      <div
        data-google-button-slot
        className={`min-h-11 w-full max-w-[22.5rem] transition-opacity duration-150 ${isRendered ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default GoogleAuthButton;
