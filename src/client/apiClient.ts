import { Configuration } from './configuration';
import { AuthApi } from './apis/auth-api';
import { AccountApi } from './apis/account-api';
import { CandidatesApi } from './apis/candidates-api';
import { InterviewsApi } from './apis/interviews-api';
import { PositionsApi } from './apis/positions-api';
import { QuestionsApi } from './apis/questions-api';
import { TeamUsersApi } from './apis/team-users-api';
import { AnalyticsReportsApi } from './apis/analytics-reports-api';
import { SettingsApi } from './apis/settings-api';
import { AIApi } from './apis/aiapi';
import { DefaultApi } from './apis/default-api';
import { VoiceInterviewsApi } from './apis/voice-interviews-api';
// Professional: Always import the auth store for token access
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

export interface ApiClient {
    auth: AuthApi;
    account: AccountApi;
    candidates: CandidatesApi;
    interviews: InterviewsApi;
    positions: PositionsApi;
    questions: QuestionsApi;
    teamUsers: TeamUsersApi;
    analyticsReports: AnalyticsReportsApi;
    settings: SettingsApi;
    ai: AIApi;
    default: DefaultApi;
    voiceInterviews: VoiceInterviewsApi;
}

/**
 * Professional API client factory.
 * - Always injects the current JWT token from zustand store into all requests via OpenAPI Configuration's accessToken property.
 * - Removes all Basic Auth logic (username/password).
 * - Ensures Authorization: Bearer <token> is set for all protected endpoints.
 * - If token is null, requests are sent without Authorization (for public endpoints).
 * - To update token after login/logout, simply re-create the client (or use a singleton pattern if desired).
 */
export function createApiClient(
    basePath: string = process.env.REACT_APP_API_BASE_URL || '/api/v1'
): ApiClient {
    // Always provide a function to access the latest token from zustand
    const config = new Configuration({
        basePath,
        accessToken: () => useAuthStore.getState().token || '',
        // baseOptions can be extended here if needed
    });

    return {
        auth: new AuthApi(config),
        account: new AccountApi(config),
        candidates: new CandidatesApi(config),
        interviews: new InterviewsApi(config),
        positions: new PositionsApi(config),
        questions: new QuestionsApi(config),
        teamUsers: new TeamUsersApi(config),
        analyticsReports: new AnalyticsReportsApi(config),
        settings: new SettingsApi(config),
        ai: new AIApi(config),
        default: new DefaultApi(config),
        voiceInterviews: new VoiceInterviewsApi(config)
    };
}

// Global axios interceptor for 401/403 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log(`🔍 ${error.response.status} ${error.response.status === 401 ? 'Unauthorized' : 'Forbidden'} detected`);
      console.log(`🔍 Request URL: ${error.config?.url}`);
      console.log(`🔍 Request method: ${error.config?.method}`);
      console.log(`🔍 Request headers:`, error.config?.headers);
      
      // Don't show modal if we're already on login page or if it's a login request
      const isLoginRequest = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/candidates/auth');
      const isOnLoginPage = window.location.pathname === '/login';
      
      if (!isLoginRequest && !isOnLoginPage) {
        // Show session expired modal instead of immediate redirect
        useAuthStore.getState().showSessionExpired();
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Global API client instance.
 * Use this singleton instance throughout the application instead of creating new clients.
 */
export const apiClient = createApiClient();