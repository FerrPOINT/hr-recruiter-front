export function getApiBaseUrl(): string {
  const host = process.env.REACT_APP_API_HOST;
  if (!host) {
    console.error('=== ENVIRONMENT DIAGNOSTICS ===');
    console.error('❌ REACT_APP_API_HOST is not set');
    console.error('📁 Current directory:', window.location.origin);
    console.error('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.error('📋 All REACT_APP_ variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
    console.error('🌍 All environment variables:', Object.keys(process.env));
    console.error('================================');
    throw new Error('REACT_APP_API_HOST is not set. Add REACT_APP_API_HOST=your-host:port to .env file and restart server');
  }
  return `http://${host}/api/v1`;
} 