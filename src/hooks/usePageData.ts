import { useState, useEffect, useCallback } from 'react';
import { optimizedApiService } from '../services/optimizedApiService';

// Простой хук для загрузки данных вакансий с batch оптимизацией
export const useVacanciesData = (params?: any) => {
  const [positions, setPositions] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<number, any>>({});
  const [questions, setQuestions] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data: any = await optimizedApiService.getVacanciesPageData(params);
      setPositions(data.positions);
      setInterviews(data.interviews);
      setStats(data.stats);
      setQuestions(data.questions);
    } catch (err: any) {
      console.error('Error loading vacancies data:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    positions,
    interviews,
    stats,
    questions,
    loading,
    error,
    refresh
  };
};

// Простой хук для загрузки данных дашборда
export const useDashboardData = (params?: any) => {
  const [positions, setPositions] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data: any = await optimizedApiService.getDashboardPageData(params);
      setPositions(data.positions);
      setInterviews(data.interviews);
      setCandidates(data.candidates);
      setStats(data.stats);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    positions,
    interviews,
    candidates,
    stats,
    loading,
    error,
    refresh
  };
};

// Простой хук для загрузки данных интервью
export const useInterviewsData = (params?: any) => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data: any = await optimizedApiService.getInterviewsPageData(params);
      setInterviews(data.interviews);
      setPositions(data.positions);
      setCandidates(data.candidates);
    } catch (err: any) {
      console.error('Error loading interviews data:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    interviews,
    positions,
    candidates,
    loading,
    error,
    refresh
  };
}; 