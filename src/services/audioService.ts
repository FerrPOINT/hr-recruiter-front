import { apiService } from './apiService';
import { BrowserAudioService } from './browserAudioService';

export interface AudioRecordingOptions {
  duration?: number;
  sampleRate?: number;
  channels?: number;
  format?: 'wav' | 'webm' | 'mp3';
  quality?: 'low' | 'medium' | 'high';
}

export interface AudioTranscriptionResult {
  success: boolean;
  transcript: string;
  error?: string;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

// Аудио сервис - работает ТОЛЬКО в браузере
export class AudioService {
  private browserService: BrowserAudioService | null = null;
  private onProgress?: (progress: number) => void;
  private onLevelChange?: (level: number) => void;

  constructor() {
    console.log('🎵 AudioService: Constructor called');
  }

  /**
   * Получает браузерный сервис (создается только в браузере)
   */
  private getBrowserService(): BrowserAudioService {
    if (!this.browserService) {
      console.log('🎵 AudioService: Creating browser service...');
      this.browserService = new BrowserAudioService();
      console.log('✅ AudioService: Browser service created');
    }
    return this.browserService;
  }

  /**
   * Проверяет поддержку аудио в браузере
   */
  async checkSupport(): Promise<{
    isBrowser: boolean;
    getUserMedia: boolean;
    mediaRecorder: boolean;
    audioContext: boolean;
    supportedFormats: string[];
  }> {
    try {
      const browserService = this.getBrowserService();
      return browserService.checkSupport();
    } catch (error) {
      console.error('❌ AudioService: Failed to check support:', error);
      return {
        isBrowser: false,
        getUserMedia: false,
        mediaRecorder: false,
        audioContext: false,
        supportedFormats: []
      };
    }
  }

  /**
   * Получает список доступных аудио устройств
   */
  async getAudioDevices(): Promise<AudioDevice[]> {
    try {
      const browserService = this.getBrowserService();
      return browserService.getAudioDevices();
    } catch (error) {
      console.error('❌ AudioService: Failed to get audio devices:', error);
      return [];
    }
  }

  /**
   * Запрашивает разрешение на доступ к микрофону
   */
  async requestPermission(deviceId?: string): Promise<any> {
    const browserService = this.getBrowserService();
    return browserService.requestPermission(deviceId);
  }

  /**
   * Начинает запись аудио
   */
  async startRecording(options: AudioRecordingOptions = {}): Promise<void> {
    const browserService = this.getBrowserService();
    
    // Настраиваем обработчики
    if (this.onLevelChange) {
      browserService.setLevelChangeHandler(this.onLevelChange);
    }
    
    await browserService.startRecording(options);
  }

  /**
   * Останавливает запись аудио
   */
  async stopRecording(): Promise<Blob> {
    const browserService = this.getBrowserService();
    return browserService.stopRecording();
  }

  /**
   * Транскрибирует аудио файл
   */
  async transcribeAudio(audioBlob: Blob): Promise<AudioTranscriptionResult> {
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { 
        type: audioBlob.type 
      });

      const result = await apiService.transcribeAudio(audioFile);
      
      return {
        success: true,
        transcript: result.transcript
      };
    } catch (error) {
      console.error('❌ AudioService: Error transcribing audio:', error);
      return {
        success: false,
        transcript: '',
        error: `Ошибка транскрибации: ${error}`
      };
    }
  }

  /**
   * Транскрибирует ответ на интервью с сохранением в БД
   */
  async transcribeInterviewAnswer(
    audioBlob: Blob, 
    interviewId: number, 
    questionId: number
  ): Promise<AudioTranscriptionResult> {
    try {
      const audioFile = new File([audioBlob], 'interview-answer.webm', { 
        type: audioBlob.type 
      });

      const result = await apiService.transcribeInterviewAnswer(
        audioFile, 
        interviewId, 
        questionId
      );
      
      return {
        success: result.success,
        transcript: result.formattedText
      };
    } catch (error) {
      console.error('❌ AudioService: Error transcribing interview answer:', error);
      return {
        success: false,
        transcript: '',
        error: `Ошибка транскрибации ответа: ${error}`
      };
    }
  }

  /**
   * Получает статус записи
   */
  async getRecordingStatus(): Promise<boolean> {
    try {
      const browserService = this.getBrowserService();
      return browserService.getRecordingStatus();
    } catch (error) {
      console.error('❌ AudioService: Error getting recording status:', error);
      return false;
    }
  }

  /**
   * Устанавливает обработчик прогресса
   */
  setProgressHandler(handler: (progress: number) => void): void {
    this.onProgress = handler;
  }

  /**
   * Устанавливает обработчик изменения уровня звука
   */
  setLevelChangeHandler(handler: (level: number) => void): void {
    this.onLevelChange = handler;
  }

  /**
   * Освобождает ресурсы
   */
  async cleanup(): Promise<void> {
    if (this.browserService) {
      try {
        this.browserService.cleanup();
        console.log('✅ AudioService: Browser resources cleaned up');
      } catch (error) {
        console.error('❌ AudioService: Error cleaning up browser resources:', error);
      }
    }
  }
}

// Создаем единственный экземпляр сервиса
export const audioService = new AudioService(); 