import { createApiClient } from '../client/apiClient';
import { LoginRequest, AuthResponse } from '../client/models';
import { mockApi } from '../mocks/mockApi';

class AuthService {
  private apiClient = createApiClient();

  // Проверяем, нужно ли использовать mock API
  private get useMock(): boolean {
    return process.env.REACT_APP_USE_MOCK_API === 'true' || process.env.REACT_APP_USE_MOCK_API === undefined;
  }

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

  // Создаем API клиент с учетными данными
  private createAuthenticatedClient(username: string, password: string) {
    return createApiClient(username, password);
  }

  // Вход в систему
  async login(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      // В мок-режиме используем mockApi
      const response = await mockApi.login(email, password);
      // Сохраняем данные пользователя в sessionStorage
      sessionStorage.setItem('currentUser', JSON.stringify(response.user));
      return response;
    }
    try {
      const userEmail = email || 'test@example.com';
      const userPassword = password || 'password';
      const loginRequest: LoginRequest = { email: userEmail, password: userPassword };
      const response = await this.apiClient.auth.login(loginRequest);
      this.saveCredentials(userEmail, userPassword);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    if (this.useMock) {
      // В мок-режиме просто очищаем данные
      sessionStorage.removeItem('currentUser');
      return;
    }
    try {
      const credentials = this.getCredentials();
      if (credentials) {
        const authenticatedClient = this.createAuthenticatedClient(
          credentials.username, 
          credentials.password
        );
        await authenticatedClient.auth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем учетные данные в любом случае
      this.clearCredentials();
    }
  }

  // Проверяем, авторизован ли пользователь
  isAuthenticated(): boolean {
    if (this.useMock) {
      return true;
    }
    return this.getCredentials() !== null;
  }

  // Получаем API клиент с текущими учетными данными
  getAuthenticatedClient() {
    if (this.useMock) {
      return createApiClient();
    }
    const credentials = this.getCredentials();
    if (!credentials) {
      throw new Error('User not authenticated');
    }
    return this.createAuthenticatedClient(credentials.username, credentials.password);
  }

  // Получаем информацию о текущем пользователе
  async getCurrentUser() {
    if (this.useMock) {
      // В мок-режиме используем mockApi
      return await mockApi.getAccount();
    }
    const client = this.getAuthenticatedClient();
    const response = await client.account.getAccount();
    return response.data;
  }
}

// Экспортируем единственный экземпляр сервиса
export const authService = new AuthService(); 