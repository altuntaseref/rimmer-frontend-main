
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthContextType {
  tokens: AuthTokens | null;
  login: (newTokens: AuthTokens) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
          return { accessToken, refreshToken };
      }
      return null;
  });

  useEffect(() => {
    if (tokens) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [tokens]);

  const login = useCallback((newTokens: AuthTokens) => {
    setTokens(newTokens);
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            // Check if the error is 401, we have a refresh token, and we haven't already retried
            if (error.response.status === 401 && tokens?.refreshToken && !originalRequest._retry) {
                originalRequest._retry = true; // Mark that we've attempted a refresh

                try {
                    // Use a new axios instance to avoid interceptor loop
                    const refreshAxios = axios.create();
                    const response = await refreshAxios.post('/api/auth/refresh', {
                        refresh_token: tokens.refreshToken,
                    });
                    
                    const newTokens = response.data; // Assuming backend returns { accessToken, refreshToken }
                    login(newTokens);

                    originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
                    return axios(originalRequest); // Retry original request with new token
                } catch (refreshError) {
                    console.error("Token refresh failed", refreshError);
                    logout(); // If refresh fails, log the user out
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    return () => {
        axios.interceptors.response.eject(interceptor);
    };

  }, [tokens, login, logout]);


  const isLoggedIn = !!tokens;

  return (
    <AuthContext.Provider value={{ tokens, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
