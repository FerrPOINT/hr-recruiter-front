/**
 * ElevenLabs Configuration
 * Конфигурация для работы с ElevenLabs Conversation AI
 */

export const elevenLabsConfig = {
  // API ключ (берется из переменных окружения)
  apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY || '',
  
  // Базовый URL API
  baseUrl: 'https://api.elevenlabs.io',
  
  // Доступные голоса
  voices: {
    adam: 'pNInz6obpgDQGcFmaJgB', // Мужской голос
    bella: 'EXAVITQu4vr4xnSDxMaL', // Женский голос
    rachel: '21m00Tcm4TlvDq8ikWAM', // Женский голос
    domi: 'AZnzlk1XvdvUeBnXmlld', // Женский голос
  },
  
  // Настройки голоса по умолчанию
  defaultVoiceSettings: {
    stability: 0.75,
    similarityBoost: 0.85,
    style: 0.5,
    useSpeakerBoost: true,
  },
  
  // Настройки сессии по умолчанию
  defaultSessionSettings: {
    enableAudioPlayback: true,
    enableAudioRecording: true,
    enableRealTimeTranscription: true,
  },
  
  // Проверка конфигурации
  validateConfig() {
    console.log('🔧 ElevenLabs Configuration Check:');
    console.log('  - API Key:', this.apiKey ? '✅ Set' : '❌ Not set');
    console.log('  - Base URL:', this.baseUrl);
    console.log('  - Default Voice:', this.voices.adam);
    
    if (!this.apiKey) {
      console.warn('⚠️ ElevenLabs API ключ не настроен');
      console.warn('   Добавьте REACT_APP_ELEVENLABS_API_KEY в .env.local');
      return false;
    }
    
    console.log('✅ ElevenLabs configuration is valid');
    return true;
  },
  
  // Получение настроек голоса
  getVoiceSettings(voiceId?: string) {
    return {
      voiceId: voiceId || this.voices.adam,
      ...this.defaultVoiceSettings,
    };
  },
  
  // Получение настроек сессии
  getSessionSettings() {
    return {
      ...this.defaultSessionSettings,
    };
  },
  
  // Инициализация конфигурации
  init() {
    this.validateConfig();
    
    // Логируем доступные голоса
    console.log('🎤 Available voices:');
    Object.entries(this.voices).forEach(([name, id]) => {
      console.log(`  - ${name}: ${id}`);
    });
  }
};

// Автоматическая инициализация при импорте
if (typeof window !== 'undefined') {
  elevenLabsConfig.init();
}

export default elevenLabsConfig; 