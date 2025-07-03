// Supabase 前端配置
// 用于直接连接测试，生产环境建议通过云函数代理

export const SUPABASE_CONFIG = {
  url: 'https://klpseujbhwvifsfshfdx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI'
};

// 为了兼容性，同时导出 supabaseConfig
export const supabaseConfig = SUPABASE_CONFIG;

// 初始化 Supabase 客户端（用于测试）
export function createSupabaseClient() {
  // 注意：小程序环境不支持直接使用 Supabase JS SDK
  // 这里仅用于配置参考，实际使用请通过云函数代理
  
  return {
    url: SUPABASE_CONFIG.url,
    headers: {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json'
    }
  }
}

// 云函数调用配置
export const CLOUD_FUNCTION = {
  name: 'supabaseProxy',
  env: 'your-env-id' // 请替换为您的云函数环境ID
}
