import React, { StrictMode, useEffect } from 'react';
import { SnackbarProvider } from 'notistack';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.tsx';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './themes/ThemeContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

axios.defaults.baseURL = `${import.meta.env.VITE_API_URL}/api`;

// Component to setup axios interceptor with Clerk context
export const AxiosInterceptorSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Filter out expected GitHub authentication errors
        const isGitHubAuthError =
          error?.config?.url?.includes('/auth/git/github/repositories') &&
          error?.response?.status === 400;

        if (!isGitHubAuthError) {
          // Log other errors
          console.error('API Error:', error);
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [getToken]);

  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Retry up to 3 times for other errors, but not for 4xx errors
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error.response as { status?: number })?.status;
          if (status && status >= 400 && status < 500) {
            return false; // Don't retry client errors
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Generally don't retry mutations
    },
  },
});

// eslint-disable-next-line react-refresh/only-export-components
const RootComponent: React.FC = () => {
  return (
    <ThemeProvider>
      <CssBaseline />
      <SnackbarProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <AxiosInterceptorSetup>
              <App />
            </AxiosInterceptorSetup>
          </ClerkProvider>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
