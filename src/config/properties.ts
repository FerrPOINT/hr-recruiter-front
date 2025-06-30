import propertiesConfig from './properties.json';

// Типы для конфигурации
interface ApiConfig {
  timeout: number;
}

interface EnvironmentConfig {
  [key: string]: string;
}

interface FeaturesConfig {
  useMock: boolean;
  debug: boolean;
}

interface PropertiesConfig {
  api: ApiConfig;
  environments: {
    development: EnvironmentConfig;
    production: EnvironmentConfig;
  };
  features: FeaturesConfig;
}

class Properties {
  private config: PropertiesConfig;
  private currentEnv: string;

  constructor() {
    this.config = propertiesConfig as PropertiesConfig;
    this.currentEnv = process.env.NODE_ENV || 'development';
  }

  /**
   * Получить API базовый URL
   */
  getApiBaseUrl(): string {
    return 'http://localhost:8080/api/v1';
  }

  /**
   * Получить таймаут API
   */
  getApiTimeout(): number {
    return 30000;
  }

  /**
   * Проверить, использовать ли mock API
   */
  shouldUseMock(): boolean {
    return false;
  }

  /**
   * Проверить, включен ли debug режим
   */
  isDebugEnabled(): boolean {
    return true;
  }

  /**
   * Получить текущее окружение
   */
  getCurrentEnvironment(): string {
    return this.currentEnv;
  }

  /**
   * Получить все настройки для текущего окружения
   */
  getEnvironmentConfig(): EnvironmentConfig {
    return this.config.environments[this.currentEnv as keyof typeof this.config.environments] || {};
  }
}

// Создаем единственный экземпляр
export const properties = new Properties();

// Экспортируем для удобства
export default properties; 