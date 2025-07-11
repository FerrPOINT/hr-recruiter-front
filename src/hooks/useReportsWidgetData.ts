import { useState, useEffect, useCallback } from 'react';
import { PositionsApi } from '../client/apis/positions-api';
import { InterviewsApi } from '../client/apis/interviews-api';
import { CandidatesApi } from '../client/apis/candidates-api';
import { AnalyticsReportsApi } from '../client/apis/analytics-reports-api';
import { Configuration } from '../client/configuration';
import { useAuthStore } from '../store/authStore';

// Создаем конфигурацию для API клиентов с JWT токеном
const createApiConfig = (): Configuration => {
  return new Configuration({
    basePath: process.env.REACT_APP_API_BASE_URL || '/api/v1',
    accessToken: () => useAuthStore.getState().token || '',
  });
};

// Хук для данных отчетов
export const useReportsWidgetData = (widgetId: string | null, params?: any) => {
  const [reports, setReports] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesStats, setCandidatesStats] = useState<any>(null);
  const [interviewsStats, setInterviewsStats] = useState<any>(null);
  const [positionsStats, setPositionsStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!widgetId) return; // Не загружаем данные, если виджет не создан
    
    setLoading(true);
    setError(null);
    
    try {
      const config = createApiConfig();
      const positionsApi = new PositionsApi(config);
      const interviewsApi = new InterviewsApi(config);
      const candidatesApi = new CandidatesApi(config);
      const analyticsApi = new AnalyticsReportsApi(config);

      // Загружаем данные для отчетов
      const [
        positionsResponse, 
        interviewsResponse, 
        candidatesResponse,
        reportsResponse,
        candidatesStatsResponse,
        interviewsStatsResponse,
        positionsStatsResponse
      ] = await Promise.all([
        positionsApi.listPositions(undefined, undefined, undefined, 1, 1000),
        interviewsApi.listInterviews(undefined, undefined, 1, 1000),
        candidatesApi.listCandidates(undefined, undefined, 1, 1000),
        analyticsApi.getReports(),
        analyticsApi.getCandidatesStats(),
        analyticsApi.getInterviewsStats(),
        analyticsApi.getPositionsStats()
      ]);

      setPositions(positionsResponse.data.content || []);
      setInterviews(interviewsResponse.data.content || []);
      setCandidates(candidatesResponse.data.content || []);
      setReports(reportsResponse.data || []);
      setCandidatesStats(candidatesStatsResponse.data);
      setInterviewsStats(interviewsStatsResponse.data);
      setPositionsStats(Array.isArray(positionsStatsResponse.data) ? positionsStatsResponse.data : []);

    } catch (err: any) {
      console.error('Error loading reports data:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [widgetId, JSON.stringify(params)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    reports,
    positions,
    interviews,
    candidates,
    candidatesStats,
    interviewsStats,
    positionsStats,
    loading,
    error,
    refresh
  };
}; 