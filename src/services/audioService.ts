import { apiService } from './apiService';

export interface AudioRecordingOptions {
  duration?: number; // в секундах
  sampleRate?: number; // частота дискретизации
  channels?: number; // количество каналов
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

// Универсальный аудио сервис, работающий в браузере и на сервере
export class AudioService {
  private isRecording = false;
  private recordingTimer: NodeJS.Timeout | null = null;
  private onProgress?: (progress: number) => void;
  private onLevelChange?: (level: number) => void;
  
  // Браузерные API (только в браузере)
  private mediaRecorder: any = null;
  private audioStream: any = null;
  private audioChunks: any[] = [];
  private audioContext: any = null;
  private analyser: any = null;

  /**
   * Проверяет, где выполняется код
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined';
  }

  /**
   * Проверяет поддержку аудио в текущей среде
   */
  async checkSupport(): Promise<{
    isBrowser: boolean;
    getUserMedia: boolean;
    mediaRecorder: boolean;
    audioContext: boolean;
    supportedFormats: string[];
  }> {
    const isBrowser = this.isBrowser();
    
    if (!isBrowser) {
      return {
        isBrowser: false,
        getUserMedia: false,
        mediaRecorder: false,
        audioContext: false,
        supportedFormats: []
      };
    }

    const supportedFormats = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav'
    ].filter(format => (window as any).MediaRecorder?.isTypeSupported?.(format) || false);

    return {
      isBrowser: true,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      mediaRecorder: !!(window as any).MediaRecorder,
      audioContext: !!(window as any).AudioContext,
      supportedFormats
    };
  }

  /**
   * Получает список доступных аудио устройств (только в браузере)
   */
  async getAudioDevices(): Promise<AudioDevice[]> {
    if (!this.isBrowser()) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Микрофон ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
    } catch (error) {
      console.error('Ошибка получения списка устройств:', error);
      return [];
    }
  }

  /**
   * Запрашивает разрешение на доступ к микрофону (только в браузере)
   */
  async requestPermission(deviceId?: string): Promise<any> {
    if (!this.isBrowser()) {
      throw new Error('Доступ к микрофону доступен только в браузере');
    }

    try {
      const constraints: any = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
          ...(deviceId && { deviceId: { exact: deviceId } })
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.audioStream = stream;
      return stream;
    } catch (error) {
      console.error('Ошибка получения доступа к микрофону:', error);
      throw new Error(`Не удалось получить доступ к микрофону: ${error}`);
    }
  }

  /**
   * Начинает запись аудио (только в браузере)
   */
  async startRecording(options: AudioRecordingOptions = {}): Promise<void> {
    if (!this.isBrowser()) {
      throw new Error('Запись аудио доступна только в браузере');
    }

    if (this.isRecording) {
      throw new Error('Запись уже идет');
    }

    try {
      // Получаем поток, если еще не получен
      if (!this.audioStream) {
        await this.requestPermission();
      }

      const {
        format = 'webm',
        quality = 'high',
        duration
      } = options;

      // Определяем MIME тип
      const mimeType = this.getMimeType(format, quality);
      
      // Создаем MediaRecorder
      const MediaRecorder = (window as any).MediaRecorder;
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType,
        audioBitsPerSecond: this.getBitRate(quality)
      });

      this.audioChunks = [];
      this.isRecording = true;

      // Настраиваем обработчики событий
      this.mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.recordingTimer) {
          clearTimeout(this.recordingTimer);
          this.recordingTimer = null;
        }
      };

      // Запускаем анализ уровня звука
      this.startAudioAnalysis();

      // Начинаем запись
      this.mediaRecorder.start(1000); // Получаем данные каждую секунду

      // Устанавливаем таймер, если указана длительность
      if (duration && duration > 0) {
        this.recordingTimer = setTimeout(() => {
          this.stopRecording();
        }, duration * 1000);
      }

      console.log('Запись аудио начата');
    } catch (error) {
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Останавливает запись аудио (только в браузере)
   */
  async stopRecording(): Promise<Blob> {
    if (!this.isBrowser()) {
      throw new Error('Запись аудио доступна только в браузере');
    }

    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Нет активной записи');
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.recordingTimer) {
          clearTimeout(this.recordingTimer);
          this.recordingTimer = null;
        }

        const blob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder.mimeType 
        });
        
        console.log(`Запись остановлена. Размер: ${blob.size} байт`);
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Транскрибирует аудио файл (работает везде)
   */
  async transcribeAudio(audioBlob: Blob): Promise<AudioTranscriptionResult> {
    try {
      // Конвертируем Blob в File
      const audioFile = new File([audioBlob], 'recording.webm', { 
        type: audioBlob.type 
      });

      // Отправляем на сервер через API
      const result = await apiService.transcribeAudio(audioFile);
      
      return {
        success: true,
        transcript: result.transcript
      };
    } catch (error) {
      console.error('Ошибка транскрибации:', error);
      return {
        success: false,
        transcript: '',
        error: `Ошибка транскрибации: ${error}`
      };
    }
  }

  /**
   * Транскрибирует ответ на интервью с сохранением в БД (работает везде)
   */
  async transcribeInterviewAnswer(
    audioBlob: Blob, 
    interviewId: number, 
    questionId: number
  ): Promise<AudioTranscriptionResult> {
    try {
      // Конвертируем Blob в File
      const audioFile = new File([audioBlob], 'interview-answer.webm', { 
        type: audioBlob.type 
      });

      // Отправляем на сервер через API
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
      console.error('Ошибка транскрибации ответа:', error);
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
  getRecordingStatus(): boolean {
    return this.isRecording;
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
  cleanup(): void {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.isBrowser()) {
      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track: any) => track.stop());
        this.audioStream = null;
      }

      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
        this.audioContext = null;
      }

      if (this.analyser) {
        this.analyser.disconnect();
        this.analyser = null;
      }
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  /**
   * Определяет MIME тип для записи
   */
  private getMimeType(format: string, quality: string): string {
    if (!this.isBrowser()) {
      return 'audio/webm';
    }

    const MediaRecorder = (window as any).MediaRecorder;
    if (!MediaRecorder) {
      return 'audio/webm';
    }

    const mimeTypes = {
      webm: ['audio/webm;codecs=opus', 'audio/webm'],
      mp3: ['audio/mp4', 'audio/mpeg'],
      wav: ['audio/wav']
    };

    const types = mimeTypes[format as keyof typeof mimeTypes] || mimeTypes.webm;
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm';
  }

  /**
   * Определяет битрейт для записи
   */
  private getBitRate(quality: string): number {
    const bitRates = {
      low: 64000,
      medium: 128000,
      high: 256000
    };
    return bitRates[quality as keyof typeof bitRates] || bitRates.high;
  }

  /**
   * Запускает анализ уровня звука (только в браузере)
   */
  private startAudioAnalysis(): void {
    if (!this.isBrowser() || !this.onLevelChange) {
      return;
    }

    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      source.connect(this.analyser);
      
      const updateLevel = () => {
        if (!this.analyser || !this.onLevelChange) return;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const level = Math.min(100, (average / 255) * 100);
        
        this.onLevelChange(level);
        
        if (this.isRecording) {
          requestAnimationFrame(updateLevel);
        }
      };
      
      updateLevel();
    } catch (error) {
      console.error('Ошибка запуска анализа уровня звука:', error);
    }
  }
}

// Создаем единственный экземпляр сервиса
export const audioService = new AudioService(); 