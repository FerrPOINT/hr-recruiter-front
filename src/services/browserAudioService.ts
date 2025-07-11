// Браузерные аудио API - выполняется ТОЛЬКО в браузере

export class BrowserAudioService {
  private isRecording = false;
  private recordingTimer: any = null;
  private onProgress?: (progress: number) => void;
  private onLevelChange?: (level: number) => void;
  
  private mediaRecorder: any = null;
  private audioStream: any = null;
  private audioChunks: any[] = [];
  private audioContext: any = null;
  private analyser: any = null;

  private currentFormat: string = 'webm';

  private onDataAvailableCount = 0;

  constructor() {
    console.log('🎵 BrowserAudioService: Constructor called');
    
    // Проверка безопасности - только при создании экземпляра
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.error('❌ BrowserAudioService: Attempting to instantiate on server!');
      throw new Error('BrowserAudioService can only be instantiated in browser environment');
    }
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
    console.log('🎵 BrowserAudioService: checkSupport called');
    
    // Детальная диагностика navigator.mediaDevices
    console.log('🎵 BrowserAudioService: navigator.mediaDevices exists:', !!navigator.mediaDevices);
    if (navigator.mediaDevices) {
      console.log('🎵 BrowserAudioService: navigator.mediaDevices.getUserMedia exists:', !!navigator.mediaDevices.getUserMedia);
      console.log('🎵 BrowserAudioService: navigator.mediaDevices.enumerateDevices exists:', !!navigator.mediaDevices.enumerateDevices);
      console.log('🎵 BrowserAudioService: navigator.mediaDevices keys:', Object.keys(navigator.mediaDevices));
    }
    
    // Проверяем протокол и безопасный контекст
    console.log('🎵 BrowserAudioService: Current protocol:', window.location.protocol);
    console.log('🎵 BrowserAudioService: Is HTTPS:', window.location.protocol === 'https:');
    console.log('🎵 BrowserAudioService: Is localhost:', window.location.hostname === 'localhost');
    console.log('🎵 BrowserAudioService: Is 127.0.0.1:', window.location.hostname === '127.0.0.1');
    
    // Проверяем Secure Context (важно для MediaDevices)
    const isSecureContext = window.isSecureContext;
    console.log('🎵 BrowserAudioService: Is Secure Context:', isSecureContext);
    
    // Проверяем, почему Secure Context может быть false
    if (!isSecureContext) {
        console.error('🎵 BrowserAudioService: НЕ безопасный контекст!');
        console.error('🎵 BrowserAudioService: Причины:');
        console.error('  - Протокол не HTTPS');
        console.error('  - Домен не localhost/127.0.0.1');
        console.error('  - Неправильные SSL сертификаты');
        console.error('  - CSP блокирует доступ');
    }
    
    const getUserMediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const mediaRecorderSupported = !!window.MediaRecorder;
    const audioContextSupported = !!window.AudioContext;
    
    console.log('🎵 BrowserAudioService: getUserMedia supported:', getUserMediaSupported);
    console.log('🎵 BrowserAudioService: MediaRecorder supported:', mediaRecorderSupported);
    console.log('🎵 BrowserAudioService: AudioContext supported:', audioContextSupported);
    
    const testFormats = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav'
    ];
    
    const supportedFormats = testFormats.filter(format => {
      const isSupported = window.MediaRecorder?.isTypeSupported?.(format) || false;
      console.log(`🎵 BrowserAudioService: Format ${format} supported:`, isSupported);
      return isSupported;
    });

    console.log('🎵 BrowserAudioService: Supported formats:', supportedFormats);

    const result = {
      isBrowser: true,
      getUserMedia: getUserMediaSupported,
      mediaRecorder: mediaRecorderSupported,
      audioContext: audioContextSupported,
      supportedFormats
    };
    
    console.log('🎵 BrowserAudioService: checkSupport result:', result);
    
    // Попробуем принудительно запросить разрешение, чтобы увидеть ошибку
    if (getUserMediaSupported) {
      console.log('🎵 BrowserAudioService: Testing getUserMedia permission...');
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎵 BrowserAudioService: getUserMedia test successful!');
        testStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('🎵 BrowserAudioService: getUserMedia test failed:', error);
        if (error instanceof Error) {
          console.error('🎵 BrowserAudioService: Error name:', error.name);
          console.error('🎵 BrowserAudioService: Error message:', error.message);
          
          // Анализируем конкретные ошибки
          if (error.name === 'NotAllowedError') {
            console.error('🎵 BrowserAudioService: Пользователь отклонил разрешение на микрофон');
          } else if (error.name === 'NotSupportedError') {
            console.error('🎵 BrowserAudioService: Браузер не поддерживает getUserMedia');
          } else if (error.name === 'NotReadableError') {
            console.error('🎵 BrowserAudioService: Микрофон занят другим приложением');
          } else if (error.name === 'SecurityError') {
            console.error('🎵 BrowserAudioService: ОШИБКА БЕЗОПАСНОСТИ - требуется HTTPS!');
          } else if (error.name === 'NotFoundError') {
            console.error('🎵 BrowserAudioService: Микрофон не найден');
          } else {
            console.error('🎵 BrowserAudioService: Неизвестная ошибка:', error.name);
          }
        }
      }
    } else {
      console.error('🎵 BrowserAudioService: getUserMedia не поддерживается');
      console.error('🎵 BrowserAudioService: Возможные причины:');
      console.error('  - Не HTTPS (SecurityError)');
      console.error('  - Браузер не поддерживает MediaDevices API');
      console.error('  - CSP блокирует доступ');
    }
    
    return result;
  }

  /**
   * Получает список доступных аудио устройств
   */
  async getAudioDevices(): Promise<any[]> {
    if (!navigator.mediaDevices) {
      console.error('❌ BrowserAudioService: MediaDevices API not available');
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Микрофон ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
      
      console.log('✅ BrowserAudioService: Found audio devices:', audioDevices.length);
      return audioDevices;
    } catch (error) {
      console.error('❌ BrowserAudioService: Error getting audio devices:', error);
      return [];
    }
  }

  /**
   * Запрашивает разрешение на доступ к микрофону
   */
  async requestPermission(deviceId?: string): Promise<any> {
    console.log('🎵 BrowserAudioService: requestPermission called');
    
    if (!navigator.mediaDevices) {
      console.error('❌ BrowserAudioService: MediaDevices API not available');
      throw new Error('MediaDevices API недоступен');
    }

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

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.audioStream = stream;
      console.log('✅ BrowserAudioService: Microphone permission granted');
      return stream;
    } catch (error) {
      console.error('❌ BrowserAudioService: Failed to get microphone permission:', error);
      throw error;
    }
  }

  /**
   * Выбирает лучший поддерживаемый формат (mp3 > wav > webm)
   */
  private selectBestFormat(): {format: string, mimeType: string} {
    const preferred = [
      {format: 'mp3', mimeType: 'audio/mpeg'},
      {format: 'wav', mimeType: 'audio/wav'},
      {format: 'webm', mimeType: 'audio/webm;codecs=opus'}
    ];
    for (const opt of preferred) {
      if (window.MediaRecorder && window.MediaRecorder.isTypeSupported(opt.mimeType)) {
        return opt;
      }
    }
    // Fallback
    return {format: 'webm', mimeType: 'audio/webm'};
  }

  /**
   * Получить текущий формат (для UI)
   */
  getCurrentFormat(): string {
    return this.currentFormat;
  }

  /**
   * Начинает запись аудио
   */
  async startRecording(options: any = {}): Promise<void> {
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder API недоступен');
    }
    if (this.isRecording) {
      throw new Error('Запись уже идет');
    }
    // Получаем поток, если еще не получен
    if (!this.audioStream) {
      await this.requestPermission();
    }
    // Выбираем лучший формат
    const {format, mimeType} = this.selectBestFormat();
    this.currentFormat = format;
    const quality = options.quality || 'high';
    // Очищаем чанки только здесь!
    this.audioChunks = [];
    this.onDataAvailableCount = 0;
    this.isRecording = true;
    // Создаем MediaRecorder
    this.mediaRecorder = new window.MediaRecorder(this.audioStream, {
      mimeType,
      audioBitsPerSecond: this.getBitRate(quality)
    });
    // Назначаем обработчики только один раз
    this.mediaRecorder.ondataavailable = (event: any) => {
      this.onDataAvailableCount++;
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
      // Минимальный лог для диагностики
      if (this.onDataAvailableCount === 1) {
        console.log('[AUDIO] ondataavailable #1, size:', event.data.size);
      } else {
        console.log('[AUDIO] ondataavailable #' + this.onDataAvailableCount + ', size:', event.data.size);
      }
    };
    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }
      const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
      console.log('[AUDIO] onstop, total chunks:', this.audioChunks.length, 'final blob size:', blob.size);
      // Не очищаем this.audioChunks до формирования Blob!
    };
    // Запускаем анализ уровня звука
    this.startAudioAnalysis();
    // Начинаем запись
    this.mediaRecorder.start();
  }

  /**
   * Останавливает запись аудио
   */
  async stopRecording(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Нет активной записи');
    }
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.recordingTimer) {
          clearTimeout(this.recordingTimer);
          this.recordingTimer = null;
        }
        const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
        console.log('[AUDIO] onstop, total chunks:', this.audioChunks.length, 'final blob size:', blob.size);
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  /**
   * Получает статус записи
   */
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * Устанавливает обработчик изменения уровня звука
   */
  setLevelChangeHandler(handler: (level: number) => void): void {
    console.log('🎵 BrowserAudioService: setLevelChangeHandler called');
    this.onLevelChange = handler;
  }

  /**
   * Освобождает ресурсы
   */
  cleanup(): void {
    console.log('🎵 BrowserAudioService: cleanup called');
    
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

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

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    
    console.log('✅ BrowserAudioService: Resources cleaned up');
  }

  /**
   * Определяет MIME тип для записи
   */
  private getMimeType(format: string, quality: string): string {
    // Не используется напрямую, но оставим для обратной совместимости
    const mimeTypes = {
      webm: ['audio/webm;codecs=opus', 'audio/webm'],
      mp3: ['audio/mpeg', 'audio/mp3', 'audio/mp4'],
      wav: ['audio/wav']
    };
    const types = mimeTypes[format as keyof typeof mimeTypes] || mimeTypes.webm;
    for (const type of types) {
      if (window.MediaRecorder.isTypeSupported(type)) {
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
   * Запускает анализ уровня звука
   */
  private startAudioAnalysis(): void {
    if (!this.onLevelChange) {
      return;
    }

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('⚠️ BrowserAudioService: AudioContext API недоступен для анализа уровня звука');
      return;
    }

    try {
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
      console.log('✅ BrowserAudioService: Audio analysis started');
    } catch (error) {
      console.error('❌ BrowserAudioService: Error starting audio analysis:', error);
    }
  }
} 