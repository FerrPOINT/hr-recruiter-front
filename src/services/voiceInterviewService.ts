/**
 * Voice Interview Service
 * Сервис для работы с голосовыми интервью через бэкенд
 */

import { apiService } from './apiService';

export interface VoiceSessionRequest {
  voiceMode?: boolean;
  autoCreateAgent?: boolean;
}

export interface VoiceSessionResponse {
  sessionId: string;
  agentId: string;
  status: string;
  webhookUrl: string;
  createdAt: string;
}

export interface VoiceMessage {
  text: string;
  audioUrl?: string;
  durationMs?: number;
  confidence?: number;
  timestamp: string;
  type?: string;
}

export interface VoiceQuestion extends VoiceMessage {
  questionId: number;
  questionText: string;
}

export interface VoiceSessionStatus {
  sessionId: string;
  status: string;
  currentQuestion: number;
  totalQuestions: number;
  duration: number;
  lastActivity: string;
}

export class VoiceInterviewService {
  /**
   * Запуск интервью с голосовым режимом
   */
  static async startInterview(interviewId: number, options: VoiceSessionRequest = {}): Promise<VoiceSessionResponse> {
    const response = await apiService.post(`/interviews/${interviewId}/start`, {
      voiceMode: true,
      autoCreateAgent: true,
      ...options
    });
    return response.data;
  }

  /**
   * Создание голосовой сессии
   */
  static async createVoiceSession(interviewId: number): Promise<VoiceSessionResponse> {
    const response = await apiService.post(`/interviews/${interviewId}/voice/session`);
    return response.data;
  }

  /**
   * Получение следующего вопроса
   */
  static async getNextQuestion(interviewId: number): Promise<VoiceQuestion> {
    const response = await apiService.get(`/interviews/${interviewId}/voice/next-question`);
    return response.data;
  }

  /**
   * Сохранение голосового ответа
   */
  static async saveVoiceAnswer(
    interviewId: number, 
    questionId: number, 
    answer: VoiceMessage
  ): Promise<any> {
    const response = await apiService.post(
      `/interviews/${interviewId}/voice/answer?questionId=${questionId}`, 
      answer
    );
    return response.data;
  }

  /**
   * Завершение голосовой сессии
   */
  static async endVoiceSession(interviewId: number): Promise<void> {
    await apiService.post(`/interviews/${interviewId}/voice/end`);
  }

  /**
   * Получение статуса голосовой сессии
   */
  static async getVoiceSessionStatus(interviewId: number): Promise<VoiceSessionStatus> {
    const response = await apiService.get(`/interviews/${interviewId}/voice/status`);
    return response.data;
  }

  /**
   * Завершение интервью
   */
  static async finishInterview(interviewId: number): Promise<any> {
    const response = await apiService.post(`/interviews/${interviewId}/finish`);
    return response.data;
  }
}

export default VoiceInterviewService; 