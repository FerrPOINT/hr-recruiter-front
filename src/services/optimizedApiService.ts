import { apiService } from './apiService';
import type { Position, Candidate, Interview, Question } from '../client/models';

// Простой кэш только для текущей сессии (без TTL)
const sessionCache = new Map<string, any>();

// Функция для получения данных из кэша сессии
function getFromSessionCache<T>(key: string): T | null {
  return sessionCache.get(key) || null;
}

// Функция для сохранения данных в кэш сессии
function setSessionCache<T>(key: string, data: T): void {
  sessionCache.set(key, data);
}

// Функция для создания ключа кэша
function createCacheKey(operation: string, params?: any): string {
  return `${operation}:${JSON.stringify(params || {})}`;
}

class OptimizedApiService {
  private candidateCache = new Map<number, Candidate>();
  private positionCache = new Map<number, Position>();

  // Кэшированная функция для получения кандидата
  private async getCandidateWithCache(id: number): Promise<Candidate | null> {
    if (this.candidateCache.has(id)) {
      return this.candidateCache.get(id)!;
    }
    
    try {
      const candidate = await apiService.getCandidate(id);
      this.candidateCache.set(id, candidate);
      return candidate;
    } catch (error) {
      console.error(`Error fetching candidate ${id}:`, error);
      return null;
    }
  }

  // Кэшированная функция для получения позиции
  private async getPositionWithCache(id: number): Promise<Position | null> {
    if (this.positionCache.has(id)) {
      return this.positionCache.get(id)!;
    }
    
    try {
      const position = await apiService.getPosition(id);
      this.positionCache.set(id, position);
      return position;
    } catch (error) {
      console.error(`Error fetching position ${id}:`, error);
      return null;
    }
  }

  // Очистка кэша
  clearCache() {
    this.candidateCache.clear();
    this.positionCache.clear();
  }
  
  // Batch загрузка кандидатов
  async getCandidatesBatch(ids: number[]): Promise<Map<number, Candidate>> {
    const result = new Map<number, Candidate>();
    const uncachedIds: number[] = [];

    // Проверяем кэш сессии
    ids.forEach(id => {
      const cached = getFromSessionCache<Candidate>(`candidate:${id}`);
      if (cached) {
        result.set(id, cached);
      } else {
        uncachedIds.push(id);
      }
    });

    // Загружаем только некэшированные
    if (uncachedIds.length > 0) {
      const candidates = await Promise.all(
        uncachedIds.map(id => 
          apiService.getCandidate(id).catch(() => null)
        )
      );

      // Кэшируем и добавляем в результат
      candidates.forEach((candidate, index) => {
        if (candidate) {
          const id = uncachedIds[index];
          setSessionCache(`candidate:${id}`, candidate);
          result.set(id, candidate);
        }
      });
    }

    return result;
  }

  // Batch загрузка позиций
  async getPositionsBatch(ids: number[]): Promise<Map<number, Position>> {
    const result = new Map<number, Position>();
    const uncachedIds: number[] = [];

    // Проверяем кэш сессии
    ids.forEach(id => {
      const cached = getFromSessionCache<Position>(`position:${id}`);
      if (cached) {
        result.set(id, cached);
      } else {
        uncachedIds.push(id);
      }
    });

    // Загружаем только некэшированные
    if (uncachedIds.length > 0) {
      const positions = await Promise.all(
        uncachedIds.map(id => 
          apiService.getPosition(id).catch(() => null)
        )
      );

      // Кэшируем и добавляем в результат
      positions.forEach((position, index) => {
        if (position) {
          const id = uncachedIds[index];
          setSessionCache(`position:${id}`, position);
          result.set(id, position);
        }
      });
    }

    return result;
  }

  // ОДИН запрос для всех данных страницы вакансий
  async getVacanciesPageData(params?: any) {
    console.log('🔄 Загружаем данные страницы вакансий (batch запросы)');
    
    // Основной запрос позиций
    const positionsResponse = await apiService.getPositions(params);
    
    // Batch запросы для всех связанных данных
    const [statsResults, interviewsResults, questionsResults] = await Promise.all([
      // Статистика для всех позиций
      Promise.all(
        positionsResponse.items.map(pos => 
          apiService.getPositionStats(pos.id).catch(() => null)
        )
      ),
      // Интервью для всех позиций
      Promise.all(
        positionsResponse.items.map(pos => 
          apiService.getPositionInterviews(pos.id).catch(() => [])
        )
      ),
      // Вопросы для всех позиций
      Promise.all(
        positionsResponse.items.map(pos => 
          apiService.getQuestions(pos.id).catch(() => ({ questions: [] }))
        )
      )
    ]);

    // Формируем результат
    const stats: Record<number, any> = {};
    const questions: Record<number, Question[]> = {};
    const allInterviews: Interview[] = [];
    
    positionsResponse.items.forEach((position, index) => {
      stats[position.id] = statsResults[index];
      questions[position.id] = questionsResults[index]?.questions || [];
      allInterviews.push(...interviewsResults[index]);
    });

    return {
      positions: positionsResponse.items,
      interviews: allInterviews,
      stats,
      questions,
      total: positionsResponse.total
    };
  }

  // ОДИН запрос для всех данных дашборда
  async getDashboardPageData(params?: any) {
    console.log('🔄 Загружаем данные дашборда (batch запросы)');
    
    // Основные запросы
    const [positionsResponse, interviewsResponse] = await Promise.all([
      apiService.getPositions({ page: 0, size: 100 }),
      apiService.getInterviews({ page: 0, size: 20 })
    ]);

    // Получаем уникальные ID кандидатов
    const candidateIds = Array.from(new Set(interviewsResponse.items.map(i => i.candidateId)));
    
    // Batch запрос кандидатов с кэшированием
    const candidatesResults = await Promise.all(
      candidateIds.map(id => this.getCandidateWithCache(id))
    );

    return {
      positions: positionsResponse.items,
      interviews: interviewsResponse.items,
      candidates: candidatesResults.filter((c): c is Candidate => c !== null),
      stats: { 
        total: interviewsResponse.total,
        positionsCount: positionsResponse.total,
        candidatesCount: candidateIds.length
      }
    };
  }

  // ОДИН запрос для всех данных страницы интервью
  async getInterviewsPageData(params?: any) {
    console.log('🔄 Загружаем данные страницы интервью (batch запросы)');
    
    // Основной запрос интервью
    const interviewsResponse = await apiService.getInterviews(params);
    
    // Получаем уникальные ID позиций и кандидатов
    const positionIds = Array.from(new Set(interviewsResponse.items.map(i => i.positionId)));
    const candidateIds = Array.from(new Set(interviewsResponse.items.map(i => i.candidateId)));
    
    // Batch запросы с кэшированием
    const [positionsResults, candidatesResults] = await Promise.all([
      Promise.all(positionIds.map(id => this.getPositionWithCache(id))),
      Promise.all(candidateIds.map(id => this.getCandidateWithCache(id)))
    ]);

    return {
      interviews: interviewsResponse.items,
      positions: positionsResults.filter((p): p is Position => p !== null),
      candidates: candidatesResults.filter((c): c is Candidate => c !== null),
      total: interviewsResponse.total
    };
  }

  // Очистка кэша сессии
  clearSessionCache(pattern?: string) {
    if (pattern) {
      // Удаляем только ключи, соответствующие паттерну
      const keys = Array.from(sessionCache.keys());
      for (const key of keys) {
        if (key.includes(pattern)) {
          sessionCache.delete(key);
        }
      }
    } else {
      // Очищаем весь кэш сессии
      sessionCache.clear();
    }
  }

  // Получение статистики кэша
  getCacheStats() {
    return {
      size: sessionCache.size,
      keys: Array.from(sessionCache.keys())
    };
  }
}

// Экспортируем единственный экземпляр
export const optimizedApiService = new OptimizedApiService(); 