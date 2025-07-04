// 环境检测工具 - 增强版
class EnvironmentDetector {
  constructor() {
    this.envInfo = this.detectEnvironment();
  }

  detectEnvironment() {
    // 检测微信小程序环境
    const isMiniProgram = typeof wx !== 'undefined' && wx.getSystemInfoSync;
    
    // 检测uni-app环境
    const isUniApp = typeof uni !== 'undefined';
    
    // 检测浏览器环境
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    
    // 检测Node.js环境
    const isNode = typeof global !== 'undefined' && typeof process !== 'undefined';

    return {
      isMiniProgram,
      isUniApp,
      isBrowser,
      isNode,
      platform: this.getPlatform()
    };
  }

  getPlatform() {
    if (this.envInfo?.isMiniProgram) return 'miniprogram';
    if (this.envInfo?.isUniApp) return 'uniapp';
    if (this.envInfo?.isBrowser) return 'browser';
    if (this.envInfo?.isNode) return 'node';
    return 'unknown';
  }

  // 检查是否为微信小程序环境
  isMiniProgram() {
    return this.envInfo.isMiniProgram;
  }

  // 检查是否为浏览器环境
  isBrowser() {
    return this.envInfo.isBrowser;
  }

  // 检查是否为uni-app环境
  isUniApp() {
    return this.envInfo.isUniApp;
  }

  // 检查是否支持WebSocket
  supportsWebSocket() {
    if (this.isMiniProgram()) {
      return typeof wx !== 'undefined' && wx.connectSocket;
    }
    return typeof WebSocket !== 'undefined';
  }

  // 检查是否支持Supabase原生客户端
  supportsSupabaseNative() {
    // 微信小程序环境不支持原生Supabase客户端
    return !this.isMiniProgram() && this.isBrowser();
  }

  // 获取环境信息
  getEnvironmentInfo() {
    return {
      ...this.envInfo,
      userAgent: this.isBrowser() ? navigator.userAgent : 'N/A',
      platform: this.getPlatform(),
      supportsWebSocket: this.supportsWebSocket(),
      supportsSupabaseNative: this.supportsSupabaseNative()
    };
  }

  // 打印环境信息
  printEnvironmentInfo() {
    const info = this.getEnvironmentInfo();
    console.log('🔍 环境检测结果:', info);
    return info;
  }
}

// 创建全局实例
const envDetector = new EnvironmentDetector();

// 导出单例和类
export default envDetector;
export { EnvironmentDetector };
