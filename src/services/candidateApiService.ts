import { apiClient } from '../client/apiClient';
import { useAuthStore } from '../store/authStore';

/**
 * API сервис для кандидатов
 * Предоставляет методы для работы с интервью кандидатов
 */
export class CandidateApiService {
  private client = apiClient;

  /**
   * Получение данных интервью
   */
  async getInterview(interviewId: number) {
    try {
      const response = await this.client.interviews.getInterview(interviewId);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview:', error);
      throw error;
    }
  }

  /**
   * Запуск интервью
   */
  async startInterview(interviewId: number, options: any = {}) {
    try {
      const response = await this.client.interviews.startInterview(interviewId, options);
      return response.data;
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  /**
   * Получение следующего вопроса
   */
  async getNextQuestion(interviewId: number) {
    try {
      const response = await this.client.voiceInterviews.getNextQuestion(interviewId);
      return response.data;
    } catch (error) {
      console.error('Error getting next question:', error);
      throw error;
    }
  }

  /**
   * Сохранение ответа
   */
  async saveAnswer(interviewId: number, questionId: number, answer: any) {
    try {
      const response = await this.client.voiceInterviews.saveVoiceAnswer(interviewId, questionId, answer);
      return response.data;
    } catch (error) {
      console.error('Error saving answer:', error);
      throw error;
    }
  }

  /**
   * Завершение интервью
   */
  async finishInterview(interviewId: number) {
    try {
      const response = await this.client.interviews.finishInterview(interviewId);
      return response.data;
    } catch (error) {
      console.error('Error finishing interview:', error);
      throw error;
    }
  }
}

export const candidateApiService = new CandidateApiService(); 