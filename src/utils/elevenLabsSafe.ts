// Безопасная обертка для ElevenLabs SDK
// Решает проблемы с отсутствующими методами в типах

export interface SessionConfig {
  agentId: string;
  voiceId?: string;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onSessionEnd?: () => void;
}

export interface Session {
  sessionId: string;
  status: string;
  agentId: string;
}

export interface VoiceMessage {
  text: string;
  audio?: string;
  timestamp: string;
}

export class ElevenLabsSafe {
  private conversation: any;
  
  constructor(conversation: any) {
    this.conversation = conversation;
  }
  
  /**
   * Безопасно запускает сессию
   */
  async startSession(config: SessionConfig): Promise<Session> {
    if (!this.conversation) {
      throw new Error('Conversation not initialized');
    }
    
    if (typeof this.conversation.startSession === 'function') {
      try {
        const session = await this.conversation.startSession(config);
        console.log('✅ Сессия запущена:', session);
        return session;
      } catch (error) {
        console.error('❌ Ошибка запуска сессии:', error);
        throw error;
      }
    } else {
      throw new Error('startSession method not available in ElevenLabs SDK');
    }
  }
  
  /**
   * Безопасно отправляет сообщение
   */
  async sendMessage(text: string): Promise<void> {
    if (!this.conversation) {
      throw new Error('Conversation not initialized');
    }
    
    if (typeof this.conversation.sendMessage === 'function') {
      try {
        await this.conversation.sendMessage(text);
        console.log('✅ Сообщение отправлено:', text);
      } catch (error) {
        console.error('❌ Ошибка отправки сообщения:', error);
        throw error;
      }
    } else {
      throw new Error('sendMessage method not available in ElevenLabs SDK');
    }
  }
  
  /**
   * Безопасно останавливает сессию
   */
  async stopSession(): Promise<void> {
    if (!this.conversation) {
      console.warn('⚠️ Conversation not initialized, skipping stopSession');
      return;
    }
    
    if (typeof this.conversation.stopSession === 'function') {
      try {
        await this.conversation.stopSession();
        console.log('✅ Сессия остановлена');
      } catch (error) {
        console.error('❌ Ошибка остановки сессии:', error);
        throw error;
      }
    } else {
      console.warn('⚠️ stopSession method not available in ElevenLabs SDK');
    }
  }
  
  /**
   * Проверяет доступность методов
   */
  checkMethods(): { startSession: boolean; sendMessage: boolean; stopSession: boolean } {
    return {
      startSession: typeof this.conversation?.startSession === 'function',
      sendMessage: typeof this.conversation?.sendMessage === 'function',
      stopSession: typeof this.conversation?.stopSession === 'function'
    };
  }
  
  /**
   * Получает информацию о доступных методах
   */
  getAvailableMethods(): string[] {
    const methods: string[] = [];
    
    if (this.conversation) {
      Object.getOwnPropertyNames(this.conversation).forEach(name => {
        if (typeof this.conversation[name] === 'function') {
          methods.push(name);
        }
      });
    }
    
    return methods;
  }
  
  /**
   * Проверяет инициализацию conversation
   */
  isInitialized(): boolean {
    return this.conversation !== null && this.conversation !== undefined;
  }
}

// Утилитарные функции
export const createElevenLabsSafe = (conversation: any): ElevenLabsSafe => {
  return new ElevenLabsSafe(conversation);
};

export const validateElevenLabsSDK = (conversation: any): boolean => {
  const safe = new ElevenLabsSafe(conversation);
  const methods = safe.checkMethods();
  
  console.log('🔍 Проверка ElevenLabs SDK методов:', methods);
  
  // Минимально необходимые методы
  const requiredMethods = ['startSession', 'sendMessage'];
  const missingMethods = requiredMethods.filter(method => !methods[method as keyof typeof methods]);
  
  if (missingMethods.length > 0) {
    console.warn('⚠️ Отсутствуют методы ElevenLabs SDK:', missingMethods);
    console.log('📋 Доступные методы:', safe.getAvailableMethods());
    return false;
  }
  
  console.log('✅ ElevenLabs SDK методы доступны');
  return true;
}; 