/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            theme: "outline";
            size: "large";
            shape: "pill";
            width: number;
            text: string;
          },
        ) => void;
      };
    };
  };
}
