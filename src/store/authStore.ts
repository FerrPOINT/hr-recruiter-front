import { create } from 'zustand';
import { AuthApi } from '../client/apis/auth-api';
import { CandidatesApi } from '../client/apis/candidates-api';
import { Configuration } from '../client/configuration';
import { LoginRequest } from '../client/models/login-request';
import { CandidateAuthRequest } from '../client/models/candidate-auth-request';
import { apiService } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'ADMIN' | 'CANDIDATE' | null;

interface AuthState {
  token: string | null;
  role: UserRole;
  user: any | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
  showSessionExpiredModal: boolean;
  loginAdmin: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginCandidate: (data: CandidateAuthRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  showSessionExpired: () => void;
  hideSessionExpired: () => void;
  setAuthError: (msg: string) => void;
}

function parseJwt(token: string): any {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return {};
  }
}

// Helper function to create API config with current token
const createApiConfig = () => new Configuration({
  accessToken: () => useAuthStore.getState().token || ''
});

// Helper function to save auth data to storage
const saveAuthData = (token: string, user: any, role: string, rememberMe: boolean = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('auth_token', token);
  storage.setItem('auth_user', JSON.stringify(user));
  storage.setItem('auth_role', role);
  storage.setItem('auth_rememberMe', rememberMe.toString());
};

// Helper function to get auth data from storage
const getAuthData = () => {
  // Сначала проверяем localStorage (запомненные сессии)
  let token = localStorage.getItem('auth_token');
  let userStr = localStorage.getItem('auth_user');
  let role = localStorage.getItem('auth_role') as UserRole;
  let rememberMe = localStorage.getItem('auth_rememberMe') === 'true';
  
  // Если в localStorage нет, проверяем sessionStorage (временные сессии)
  if (!token || !userStr) {
    token = sessionStorage.getItem('auth_token');
    userStr = sessionStorage.getItem('auth_user');
    role = sessionStorage.getItem('auth_role') as UserRole;
    rememberMe = false;
  }
  
  return { token, userStr, role, rememberMe };
};

// Helper function to clear auth data from both storages
const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('auth_rememberMe');
  
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
  sessionStorage.removeItem('auth_role');
  sessionStorage.removeItem('auth_rememberMe');
};



export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  user: null,
  isAuth: false,
  isLoading: true, // Initialize loading to true
  error: null,
  showSessionExpiredModal: false,
  async loginAdmin(email: string, password: string, rememberMe: boolean = false) {
    try {
      console.log('🔍 loginAdmin - Starting login process');
      // For login, we don't need token yet, so empty constructor is fine
      const api = new AuthApi();
      const res = await api.login({ email, password });
      const { token, user } = res.data;
      const payload = token ? parseJwt(token as string) : {};
      
      console.log('🔍 loginAdmin - Token received:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('🔍 loginAdmin - Token payload:', payload);
      
      // Сохраняем токен в соответствующее хранилище
      if (token) {
        saveAuthData(token as string, user, payload.role || 'ADMIN', rememberMe);
      }
      
      set({ token, user, role: payload.role || 'ADMIN', isAuth: true, error: null });
      
      // Обновляем API клиент с новым токеном
      apiService.refreshApiClient();
      console.log('🔍 loginAdmin - Login completed successfully');
    } catch (e: any) {
      console.error('🔍 loginAdmin - Login failed:', e);
      set({ error: e?.message || 'Ошибка авторизации', isAuth: false });
      throw e;
    }
  },
  async loginCandidate(data: CandidateAuthRequest, rememberMe: boolean = false) {
    try {
      // For candidate auth, we don't need token yet, so empty constructor is fine
      const api = new CandidatesApi();
      const res = await api.authCandidate(data);
      const { token, candidate } = res.data;
      const payload = token ? parseJwt(token as string) : {};
      
      // Сохраняем токен в соответствующее хранилище
      if (token) {
        saveAuthData(token as string, candidate, payload.role || 'CANDIDATE', rememberMe);
      }
      
      set({ token, user: candidate, role: payload.role || 'CANDIDATE', isAuth: true, error: null });
      
      // Обновляем API клиент с новым токеном
      apiService.refreshApiClient();
    } catch (e: any) {
      set({ error: e?.message || 'Ошибка авторизации кандидата', isAuth: false });
      throw e;
    }
  },
  logout() {
    // Очищаем оба хранилища
    clearAuthData();
    // Очищаем данные формы кандидата
    localStorage.removeItem('candidate_form_data');
    // Очищаем состояние чекбокса админа
    localStorage.removeItem('admin_remember_me');
    set({ token: null, role: null, user: null, isAuth: false, isLoading: false, error: null });
    
    // Обновляем API клиент после выхода
    apiService.refreshApiClient();
  },
    async restoreSession() {
    set({ isLoading: true });
    try {
      console.log('🔍 restoreSession - Starting session restoration');
      const { token, userStr, role, rememberMe } = getAuthData();
      
      console.log('🔍 restoreSession - Found token:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('🔍 restoreSession - Found user:', !!userStr);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        const payload = parseJwt(token);
        
        console.log('🔍 restoreSession - Token payload:', payload);
        
        // Проверяем, не истек ли токен
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          console.log('🔍 restoreSession - Token expired, clearing session');
          clearAuthData();
          localStorage.removeItem('candidate_form_data');
          localStorage.removeItem('admin_remember_me');
          set({ token: null, role: null, user: null, isAuth: false, isLoading: false, error: null });
          apiService.refreshApiClient();
          return;
        }
        
        set({ token, user, role, isAuth: true, error: null, isLoading: false });
        apiService.refreshApiClient();
        console.log('🔍 restoreSession - Session restored successfully', { rememberMe });
      } else {
        console.log('🔍 restoreSession - No saved session found');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('🔍 restoreSession - Error restoring session:', error);
      clearAuthData();
      localStorage.removeItem('candidate_form_data');
      localStorage.removeItem('admin_remember_me');
      set({ token: null, role: null, user: null, isAuth: false, isLoading: false, error: null });
      apiService.refreshApiClient();
          }
    },
  showSessionExpired() {
    set({ showSessionExpiredModal: true });
  },
  hideSessionExpired() {
    set({ showSessionExpiredModal: false });
  },
  setAuthError(msg: string) {
    set({ error: msg });
  },
})); 