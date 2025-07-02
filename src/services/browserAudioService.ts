// Браузерные аудио API - выполняется ТОЛЬКО в браузере
console.log('🎵 BrowserAudioService: Module loaded');

// Строгая проверка - если мы не в браузере, модуль не должен загружаться
if (typeof window === 'undefined' || typeof navigator === 'undefined') {
  console.error('❌ BrowserAudioService: Attempting to load on server!');
  throw new Error('BrowserAudioService can only be loaded in browser environment');
}

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

  constructor() {
    console.log('🎵 BrowserAudioService: Constructor called');
    
    // Дополнительная проверка безопасности
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      throw new Error('BrowserAudioService can only be instantiated in browser environment');
    }
  }

  /**
   * Проверяет поддержку аудио в браузере
   */
  checkSupport(): {
    isBrowser: boolean;
    getUserMedia: boolean;
    mediaRecorder: boolean;
    audioContext: boolean;
    supportedFormats: string[];
  } {
    console.log('🎵 BrowserAudioService: checkSupport called');
    
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
   * Начинает запись аудио
   */
  async startRecording(options: any = {}): Promise<void> {
    console.log('🎵 BrowserAudioService: startRecording called');
    
    if (!window.MediaRecorder) {
      console.error('❌ BrowserAudioService: MediaRecorder API not available');
      throw new Error('MediaRecorder API недоступен');
    }

    if (this.isRecording) {
      console.error('❌ BrowserAudioService: Recording already in progress');
      throw new Error('Запись уже идет');
    }

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
    this.mediaRecorder = new window.MediaRecorder(this.audioStream, {
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
    this.mediaRecorder.start(1000);

    // Устанавливаем таймер, если указана длительность
    if (duration && duration > 0) {
      this.recordingTimer = setTimeout(() => {
        this.stopRecording();
      }, duration * 1000);
    }

    console.log('✅ BrowserAudioService: Recording started successfully');
  }

  /**
   * Останавливает запись аудио
   */
  async stopRecording(): Promise<Blob> {
    console.log('🎵 BrowserAudioService: stopRecording called');
    
    if (!this.isRecording || !this.mediaRecorder) {
      console.error('❌ BrowserAudioService: No active recording to stop');
      throw new Error('Нет активной записи');
    }

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.recordingTimer) {
          clearTimeout(this.recordingTimer);
          this.recordingTimer = null;
        }

        const blob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder.mimeType 
        });
        
        console.log(`✅ BrowserAudioService: Recording stopped. Size: ${blob.size} bytes`);
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
    const mimeTypes = {
      webm: ['audio/webm;codecs=opus', 'audio/webm'],
      mp3: ['audio/mp4', 'audio/mpeg'],
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