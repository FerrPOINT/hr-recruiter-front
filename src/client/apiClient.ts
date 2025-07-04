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
}

// Best practice: используем только REACT_APP_API_BASE_URL для настройки API
export function createApiClient(
    username?: string, 
    password?: string, 
    basePath: string = process.env.REACT_APP_API_BASE_URL || '/api/v1'
): ApiClient {
    // Для отладки:
    console.log('🔧 createApiClient DEBUG:');
    console.log('  REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
    console.log('  basePath:', basePath);
    const config = new Configuration({
        username,
        password,
        basePath,
        baseOptions: {
            // Убираем глобальный Content-Type, чтобы он не переопределял multipart/form-data
            // headers: {
            //     'Content-Type': 'application/json',
            // },
            // Правильная настройка Basic Auth для axios
            auth: username && password ? {
                username,
                password
            } : undefined
        }
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
        default: new DefaultApi(config)
    };
}