import { apiService } from './apiService';
import { AuthResponse } from '../client/models/auth-response';

class AuthService {
  // Сохраняем учетные данные в sessionStorage (не localStorage для безопасности)
  private saveCredentials(username: string, password: string) {
    sessionStorage.setItem('auth_username', username);
    sessionStorage.setItem('auth_password', password);
  }

  // Получаем сохраненные учетные данные
  private getCredentials(): { username: string; password: string } | null {
    const username = sessionStorage.getItem('auth_username');
    const password = sessionStorage.getItem('auth_password');
    
    if (username && password) {
      return { username, password };
    }
    
    return null;
  }

  // Очищаем учетные данные
  private clearCredentials() {
    sessionStorage.removeItem('auth_username');
    sessionStorage.removeItem('auth_password');
  }

  // Вход в систему
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.login(email, password);
      this.saveCredentials(email, password);
      // Сохраняем данные пользователя в sessionStorage
      sessionStorage.setItem('currentUser', JSON.stringify(response.user));
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем учетные данные в любом случае
      this.clearCredentials();
      sessionStorage.removeItem('currentUser');
    }
  }

  // Проверяем, авторизован ли пользователь
  isAuthenticated(): boolean {
    return this.getCredentials() !== null;
  }

  // Получаем информацию о текущем пользователе
  async getCurrentUser() {
    try {
      return await apiService.getAccount();
    } catch (error) {
      console.error('Get current user error:', error);
      // Возвращаем сохраненного пользователя из sessionStorage как fallback
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      throw error;
    }
  }
}

// Экспортируем единственный экземпляр сервиса
export const authService = new AuthService(); 