// Сервис для автоматического создания и управления агентами ElevenLabs

import { apiService } from './apiService';

export interface Agent {
  id: number;
  name: string;
  description: string;
  elevenLabsAgentId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'ERROR';
  interviewId: number;
  positionId: number;
  config: AgentConfig;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  prompt: string;
  voiceId: string;
  voiceSettings?: VoiceSettings;
  tools: string[];
  webhookUrl: string;
  language: string;
  personality: string;
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

export interface Interview {
  id: number;
  candidateId: number;
  positionId: number;
  status: string;
  candidate?: Candidate;
  position?: Position;
}

export interface Position {
  id: number;
  title: string;
  description?: string;
  level?: string;
  language?: string;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

export class AgentService {
  private static instance: AgentService;
  
  private constructor() {}
  
  static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  /**
   * Создает агента для интервью автоматически
   */
  async createAgentForInterview(interviewId: number): Promise<Agent> {
    try {
      console.log(`🤖 Создание агента для интервью ${interviewId}...`);
      
      // 1. Получаем информацию об интервью
      const interview = await this.getInterview(interviewId);
      console.log('📋 Информация об интервью получена:', interview);
      
      // 2. Проверяем, есть ли уже агент для этого интервью
      const existingAgent = await this.getAgentByInterviewId(interviewId);
      if (existingAgent) {
        console.log('✅ Агент уже существует:', existingAgent);
        return existingAgent;
      }
      
      // 3. Создаем конфигурацию агента
      const config = this.buildAgentConfig(interview);
      console.log('⚙️ Конфигурация агента создана:', config);
      
      // 4. Создаем агента через API
      const agent = await this.createAgent({
        interviewId,
        config
      });
      
      console.log('✅ Агент создан успешно:', agent);
      return agent;
      
    } catch (error) {
      console.error('❌ Ошибка создания агента:', error);
      throw error;
    }
  }

  /**
   * Получает информацию об интервью
   */
  private async getInterview(interviewId: number): Promise<Interview> {
    try {
      const response = await apiService.get(`/interviews/${interviewId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка получения интервью:', error);
      throw new Error('Интервью не найдено');
    }
  }

  /**
   * Проверяет существование агента для интервью
   */
  private async getAgentByInterviewId(interviewId: number): Promise<Agent | null> {
    try {
      const response = await apiService.get('/agents', {
        params: { interviewId }
      });
      
      const agents = response.data.content || [];
      return agents.length > 0 ? agents[0] : null;
    } catch (error) {
      console.warn('⚠️ Ошибка проверки существующего агента:', error);
      return null;
    }
  }

  /**
   * Создает конфигурацию агента на основе интервью
   */
  private buildAgentConfig(interview: Interview): AgentConfig {
    const position = interview.position;
    const candidate = interview.candidate;
    
    if (!position) {
      throw new Error('Информация о позиции не найдена');
    }

    const prompt = this.buildInterviewPrompt(position, candidate);
    const voiceId = this.selectVoiceForPosition(position);
    const webhookUrl = this.buildWebhookUrl(interview.id);

    return {
      name: `Interview Agent - ${position.title}`,
      description: `AI interviewer for ${position.title} position`,
      prompt,
      voiceId,
      voiceSettings: {
        stability: 0.75,
        similarityBoost: 0.85,
        style: 0.5,
        useSpeakerBoost: true
      },
      tools: ['getNextQuestion', 'saveAnswer', 'endInterview'],
      webhookUrl,
      language: position.language || 'ru',
      personality: 'professional'
    };
  }

  /**
   * Создает промпт для агента
   */
  private buildInterviewPrompt(position: Position, candidate?: Candidate): string {
    const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'кандидат';
    
    return `
Ты проводишь собеседование на позицию "${position.title}".

Инструкции:
1. Используй инструмент getNextQuestion для получения вопросов
2. Озвучивай вопросы четко и профессионально
3. Дождись ответа кандидата
4. Используй saveAnswer для сохранения ответа
5. Заверши интервью после последнего вопроса

Позиция: ${position.title}
${position.description ? `Описание: ${position.description}` : ''}
${position.level ? `Уровень: ${position.level}` : ''}
${position.language ? `Язык: ${position.language}` : ''}
Кандидат: ${candidateName}

Будь вежливым, профессиональным и внимательным к ответам кандидата.
    `.trim();
  }

  /**
   * Выбирает голос для позиции
   */
  private selectVoiceForPosition(position: Position): string {
    const language = position.language?.toLowerCase() || 'ru';
    const level = position.level?.toLowerCase() || 'middle';
    
    // Голоса ElevenLabs
    const voices = {
      ru: {
        senior: '21m00Tcm4TlvDq8ikWAM', // Rachel - более серьезный
        default: 'pNInz6obpgDQGcFmaJgB'  // Adam - стандартный
      },
      en: {
        senior: 'EXAVITQu4vr4xnSDxMaL', // Bella - английский
        default: 'pNInz6obpgDQGcFmaJgB'  // Adam - стандартный
      }
    };
    
    const languageVoices = voices[language as keyof typeof voices] || voices.ru;
    return level === 'senior' ? languageVoices.senior : languageVoices.default;
  }

  /**
   * Создает URL для webhook
   */
  private buildWebhookUrl(interviewId: number): string {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/api/v1/webhooks/elevenlabs/events?interviewId=${interviewId}`;
  }

  /**
   * Создает агента через API
   */
  private async createAgent(data: { interviewId: number; config: AgentConfig }): Promise<Agent> {
    try {
      const response = await apiService.post('/agents', data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка создания агента через API:', error);
      throw new Error('Не удалось создать агента');
    }
  }

  /**
   * Получает агента по ID
   */
  async getAgent(agentId: number): Promise<Agent> {
    try {
      const response = await apiService.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка получения агента:', error);
      throw new Error('Агент не найден');
    }
  }

  /**
   * Обновляет агента
   */
  async updateAgent(agentId: number, config: Partial<AgentConfig>): Promise<Agent> {
    try {
      const response = await apiService.put(`/agents/${agentId}`, { config });
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка обновления агента:', error);
      throw new Error('Не удалось обновить агента');
    }
  }

  /**
   * Удаляет агента
   */
  async deleteAgent(agentId: number): Promise<void> {
    try {
      await apiService.delete(`/agents/${agentId}`);
      console.log('✅ Агент удален');
    } catch (error) {
      console.error('❌ Ошибка удаления агента:', error);
      throw new Error('Не удалось удалить агента');
    }
  }

  /**
   * Тестирует агента
   */
  async testAgent(agentId: number, message: string): Promise<string> {
    try {
      const response = await apiService.post(`/agents/${agentId}/test`, {
        message
      });
      return response.data.response;
    } catch (error) {
      console.error('❌ Ошибка тестирования агента:', error);
      throw new Error('Не удалось протестировать агента');
    }
  }
}

// Экспортируем singleton
export const agentService = AgentService.getInstance(); 