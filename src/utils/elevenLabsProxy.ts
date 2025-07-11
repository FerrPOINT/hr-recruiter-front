/**
 * ElevenLabs SDK Proxy - Monkey-patch для перенаправления трафика через backend
 * 
 * Этот файл перехватывает все обращения к ElevenLabs API и перенаправляет их
 * через ваш backend-прокси, чтобы не светить API-ключ на клиенте.
 */

interface ProxyConfig {
  backendUrl: string;
  originalElevenLabsUrl: string;
  apiKey?: string; // API-ключ для backend (если нужен)
}

class ElevenLabsProxy {
  private config: ProxyConfig;
  private originalFetch!: typeof fetch;
  private originalWebSocket!: typeof WebSocket;
  private isPatched = false;

  constructor(config: ProxyConfig) {
    this.config = {
      backendUrl: config.backendUrl.replace(/\/$/, ''), // Убираем trailing slash
      originalElevenLabsUrl: config.originalElevenLabsUrl || 'https://api.elevenlabs.io',
      apiKey: config.apiKey
    };
  }

  /**
   * Применяет monkey-patch для перехвата всех обращений к ElevenLabs
   */
  patch(): void {
    if (this.isPatched) {
      console.warn('ElevenLabs proxy already patched');
      return;
    }

    console.log('🔧 Applying ElevenLabs proxy patch...');
    console.log(`Backend URL: ${this.config.backendUrl}`);
    console.log(`Original ElevenLabs URL: ${this.config.originalElevenLabsUrl}`);

    // Сохраняем оригинальные функции
    this.originalFetch = window.fetch;
    this.originalWebSocket = window.WebSocket;

    // Патчим fetch
    this.patchFetch();
    
    // Патчим WebSocket
    this.patchWebSocket();

    this.isPatched = true;
    console.log('✅ ElevenLabs proxy patch applied successfully');
  }

  /**
   * Убирает monkey-patch
   */
  unpatch(): void {
    if (!this.isPatched) {
      console.warn('ElevenLabs proxy not patched');
      return;
    }

    console.log('🔧 Removing ElevenLabs proxy patch...');

    // Восстанавливаем оригинальные функции
    window.fetch = this.originalFetch;
    window.WebSocket = this.originalWebSocket;

    this.isPatched = false;
    console.log('✅ ElevenLabs proxy patch removed');
  }

  /**
   * Патчит fetch для перехвата REST API запросов
   */
  private patchFetch(): void {
    const self = this;
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Проверяем, является ли это запросом к ElevenLabs
      if (self.shouldProxy(url)) {
        console.log(`🔄 Proxying fetch request: ${url}`);
        
        // Заменяем URL на наш backend
        const proxiedUrl = self.proxyUrl(url);
        console.log(`📡 Proxied to: ${proxiedUrl}`);
        
        // Добавляем заголовки для прокси
        const proxiedInit = self.prepareProxiedRequest(init);
        
        // Выполняем запрос через оригинальный fetch
        return self.originalFetch(proxiedUrl, proxiedInit);
      }
      
      // Для всех остальных запросов используем оригинальный fetch
      return self.originalFetch(input, init);
    };
  }

  /**
   * Патчит WebSocket для перехвата real-time соединений
   */
  private patchWebSocket(): void {
    const self = this;
    const OriginalWebSocket = this.originalWebSocket;
    
    // Создаём новый конструктор WebSocket
    function ProxiedWebSocket(url: string, protocols?: string | string[]) {
      // Проверяем, является ли это WebSocket соединением с ElevenLabs
      if (self.shouldProxy(url)) {
        console.log(`🔄 Proxying WebSocket connection: ${url}`);
        
        // Заменяем URL на наш backend
        const proxiedUrl = self.proxyWebSocketUrl(url);
        console.log(`📡 Proxied WebSocket to: ${proxiedUrl}`);
        
        // Создаём WebSocket с проксированным URL
        return new OriginalWebSocket(proxiedUrl, protocols);
      }
      
      // Для всех остальных WebSocket используем оригинальный конструктор
      return new OriginalWebSocket(url, protocols);
    }
    
    // Копируем статические свойства
    ProxiedWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    ProxiedWebSocket.OPEN = OriginalWebSocket.OPEN;
    ProxiedWebSocket.CLOSING = OriginalWebSocket.CLOSING;
    ProxiedWebSocket.CLOSED = OriginalWebSocket.CLOSED;
    
    // Заменяем глобальный WebSocket
    window.WebSocket = ProxiedWebSocket as unknown as typeof WebSocket;
  }

  /**
   * Проверяет, нужно ли проксировать URL
   */
  private shouldProxy(url: string): boolean {
    return url.includes(this.config.originalElevenLabsUrl) || 
           url.includes('elevenlabs.io') ||
           url.includes('api.elevenlabs.io');
  }

  /**
   * Заменяет URL ElevenLabs на URL вашего backend
   */
  private proxyUrl(originalUrl: string): string {
    return originalUrl.replace(
      this.config.originalElevenLabsUrl,
      `${this.config.backendUrl}/elevenlabs-proxy`
    );
  }

  /**
   * Заменяет WebSocket URL ElevenLabs на URL вашего backend
   */
  private proxyWebSocketUrl(originalUrl: string): string {
    // WebSocket URL обычно выглядит как wss://api.elevenlabs.io/...
    return originalUrl.replace(
      'wss://api.elevenlabs.io',
      `${this.config.backendUrl.replace('https://', 'wss://').replace('http://', 'ws://')}/elevenlabs-proxy/ws`
    );
  }

  /**
   * Подготавливает запрос для прокси (добавляет заголовки, API-ключ и т.д.)
   */
  private prepareProxiedRequest(init?: RequestInit): RequestInit {
    const proxiedInit = { ...init };
    
    // Добавляем заголовки для прокси
    const headers = new Headers(init?.headers);
    
    // Если у нас есть API-ключ для backend, добавляем его
    if (this.config.apiKey) {
      headers.set('X-Backend-API-Key', this.config.apiKey);
    }
    
    // Добавляем заголовок, чтобы backend знал, что это проксированный запрос
    headers.set('X-ElevenLabs-Proxy', 'true');
    
    // Добавляем CORS заголовки, если нужно
    headers.set('X-Requested-With', 'XMLHttpRequest');
    
    proxiedInit.headers = headers;
    
    return proxiedInit;
  }

  /**
   * Проверяет, применён ли патч
   */
  isPatchedApplied(): boolean {
    return this.isPatched;
  }

  /**
   * Получает текущую конфигурацию
   */
  getConfig(): ProxyConfig {
    return { ...this.config };
  }
}

// Создаём глобальный экземпляр прокси
let globalProxy: ElevenLabsProxy | null = null;

/**
 * Инициализирует и применяет ElevenLabs прокси
 */
export function initElevenLabsProxy(config: ProxyConfig): ElevenLabsProxy {
  if (globalProxy) {
    console.warn('ElevenLabs proxy already initialized');
    return globalProxy;
  }

  globalProxy = new ElevenLabsProxy(config);
  globalProxy.patch();
  
  return globalProxy;
}

/**
 * Получает глобальный экземпляр прокси
 */
export function getElevenLabsProxy(): ElevenLabsProxy | null {
  return globalProxy;
}

/**
 * Убирает прокси
 */
export function removeElevenLabsProxy(): void {
  if (globalProxy) {
    globalProxy.unpatch();
    globalProxy = null;
  }
}

/**
 * Проверяет, инициализирован ли прокси
 */
export function isElevenLabsProxyInitialized(): boolean {
  return globalProxy !== null && globalProxy.isPatchedApplied();
}

export default ElevenLabsProxy; 