import { useState, useEffect, useCallback } from 'react';
import { 
    Candidate, 
    Position, 
    Interview, 
    Question, 
    User, 
    InterviewStats,
    MonthlyReport,
    PaginatedResponse
} from '../client';
import { apiClient } from '../client/apiClient';
import { 
    mapCandidateStatusEnum, 
    mapPositionStatusEnum, 
    mapInterviewStatusEnum, 
    mapRoleEnum 
} from '../utils/enumMapper';

export const useVacancyListData = () => {
    const [data, setData] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.positions.listPositions();
            const positions = response.data.content.map((position: any) => ({
                ...position,
                status: mapPositionStatusEnum(position.status)
            }));
            setData(positions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch vacancies');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useCandidatesData = () => {
    const [data, setData] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.candidates.listCandidates();
            const candidates = response.data.content.map((candidate: any) => ({
                ...candidate,
                status: mapCandidateStatusEnum(candidate.status)
            }));
            setData(candidates);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useTeamData = () => {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.teamUsers.listUsers();
            const users = response.data.content.map((user: any) => ({
                ...user,
                role: mapRoleEnum(user.role)
            }));
            setData(users);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch team members');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useQuestionsData = () => {
    const [data, setData] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Используем listPositionQuestions с дефолтным positionId
            const response = await apiClient.questions.listPositionQuestions(1);
            setData(response.data.content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useDashboardData = () => {
    const [data, setData] = useState<{
        totalCandidates: number;
        totalPositions: number;
        totalInterviews: number;
        recentInterviews: Interview[];
    }>({
        totalCandidates: 0,
        totalPositions: 0,
        totalInterviews: 0,
        recentInterviews: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [candidatesResponse, positionsResponse, interviewsResponse] = await Promise.all([
                apiClient.candidates.listCandidates(),
                apiClient.positions.listPositions(),
                apiClient.interviews.listInterviews()
            ]);

            const recentInterviews = interviewsResponse.data.content
                .slice(0, 5)
                .map((interview: any) => ({
                    ...interview,
                    status: mapInterviewStatusEnum(interview.status)
                }));

            setData({
                totalCandidates: candidatesResponse.data.content.length,
                totalPositions: positionsResponse.data.content.length,
                totalInterviews: interviewsResponse.data.content.length,
                recentInterviews
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useInterviewListData = () => {
    const [data, setData] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.interviews.listInterviews();
            const interviews = response.data.content.map((interview: any) => ({
                ...interview,
                status: mapInterviewStatusEnum(interview.status)
            }));
            setData(interviews);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch interviews');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useStatsData = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Используем listInterviews для получения статистики
            const response = await apiClient.interviews.listInterviews();
            const interviews = response.data.content;
            setData({
                total: interviews.length,
                completed: interviews.filter((i: any) => i.status === 'finished').length,
                inProgress: interviews.filter((i: any) => i.status === 'in_progress').length
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useReportsData = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Пока используем пустой массив, так как API для отчетов не реализован
            setData([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useCalendarData = () => {
    const [data, setData] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.interviews.listInterviews();
            const interviews = response.data.content
                .filter((interview: any) => interview.scheduledAt)
                .map((interview: any) => ({
                    ...interview,
                    status: mapInterviewStatusEnum(interview.status)
                }));
            setData(interviews);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch calendar data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
};

export const useNotificationsData = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Placeholder for notifications API
            setData([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
}; 