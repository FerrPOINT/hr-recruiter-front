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

export function createApiClient(
    username?: string, 
    password?: string, 
    basePath?: string
): ApiClient {
    const config = new Configuration({
        username,
        password,
        basePath: basePath || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'
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