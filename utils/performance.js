// utils/performance.js
// 性能监控工具

/**
 * 性能监控管理器
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.timers = {};
    this.logs = [];
    this.isEnabled = true;
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化监控
   */
  init() {
    // 防止重复初始化
    if (this.initialized) return;
    this.initialized = true;
    
    // 添加安全检查，防止递归调用
    this.isMonitoring = false;
    
    try {
      // 只在非监控状态下执行监控初始化
      if (!this.isMonitoring) {
        this.isMonitoring = true;
        
        // 监听页面性能
        this.monitorPagePerformance();
        
        // 监听网络请求（但不监控日志相关请求）
        this.monitorNetworkRequests();
        
        // 监听内存使用（轻量级监控）
        this.monitorMemoryUsage();
        
        this.isMonitoring = false;
      }
    } catch (error) {
      this.isMonitoring = false;
      console.warn('性能监控初始化失败:', error);
    }
  }
  
  /**
   * 开始计时
   */
  startTimer(name) {
    if (!this.isEnabled) return;
    
    this.timers[name] = {
      start: Date.now(),
      name
    };
  }
  
  /**
   * 结束计时
   */
  endTimer(name) {
    if (!this.isEnabled || !this.timers[name]) return;
    
    const timer = this.timers[name];
    const duration = Date.now() - timer.start;
    
    this.recordMetric(name, {
      type: 'timing',
      duration,
      timestamp: new Date().toISOString()
    });
    
    delete this.timers[name];
    return duration;
  }
  
  /**
   * 记录指标
   */
  recordMetric(name, data) {
    if (!this.isEnabled) return;
    
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    
    this.metrics[name].push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // 保持最近100条记录
    if (this.metrics[name].length > 100) {
      this.metrics[name] = this.metrics[name].slice(-100);
    }
    
    // 记录日志
    this.addLog('metric', { name, data });
  }
  
  /**
   * 监控页面性能
   */
  monitorPagePerformance() {
    const originalNavigateTo = uni.navigateTo;
    const originalRedirectTo = uni.redirectTo;
    const originalSwitchTab = uni.switchTab;
    
    // 包装页面跳转方法
    uni.navigateTo = (options) => {
      this.startTimer(`navigate_${options.url}`);
      
      const originalSuccess = options.success;
      options.success = (res) => {
        this.endTimer(`navigate_${options.url}`);
        if (originalSuccess) originalSuccess(res);
      };
      
      return originalNavigateTo.call(uni, options);
    };
    
    uni.redirectTo = (options) => {
      this.startTimer(`redirect_${options.url}`);
      
      const originalSuccess = options.success;
      options.success = (res) => {
        this.endTimer(`redirect_${options.url}`);
        if (originalSuccess) originalSuccess(res);
      };
      
      return originalRedirectTo.call(uni, options);
    };
    
    uni.switchTab = (options) => {
      this.startTimer(`switchTab_${options.url}`);
      
      const originalSuccess = options.success;
      options.success = (res) => {
        this.endTimer(`switchTab_${options.url}`);
        if (originalSuccess) originalSuccess(res);
      };
      
      return originalSwitchTab.call(uni, options);
    };
  }
  
  /**
   * 监控网络请求
   */
  monitorNetworkRequests() {
    const originalRequest = uni.request;
    
    uni.request = (options) => {
      const requestId = `request_${Date.now()}_${Math.random()}`;
      this.startTimer(requestId);
      
      const originalSuccess = options.success;
      const originalFail = options.fail;
      const originalComplete = options.complete;
      
      options.success = (res) => {
        const duration = this.endTimer(requestId);
        this.recordMetric('network_success', {
          url: options.url,
          method: options.method || 'GET',
          duration,
          status: res.statusCode
        });
        if (originalSuccess) originalSuccess(res);
      };
      
      options.fail = (err) => {
        const duration = this.endTimer(requestId);
        this.recordMetric('network_error', {
          url: options.url,
          method: options.method || 'GET',
          duration,
          error: err.errMsg || err.message
        });
        if (originalFail) originalFail(err);
      };
      
      options.complete = (res) => {
        if (originalComplete) originalComplete(res);
      };
      
      return originalRequest.call(uni, options);
    };
  }
  
  /**
   * 监控内存使用
   */
  monitorMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      setInterval(() => {
        this.recordMetric('memory_usage', {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }, 30000); // 每30秒记录一次
    }
  }
  
  /**
   * 添加日志
   */
  addLog(type, data) {
    this.logs.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    // 保持最近1000条日志
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }
  
  /**
   * 获取性能报告
   */
  getReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.generateSummary()
    };
    
    return report;
  }
  
  /**
   * 生成摘要
   */
  generateSummary() {
    const summary = {
      totalRequests: 0,
      avgRequestTime: 0,
      errorRate: 0,
      pageNavigations: 0,
      avgPageLoadTime: 0
    };
    
    // 计算网络请求统计
    const successRequests = this.metrics['network_success'] || [];
    const errorRequests = this.metrics['network_error'] || [];
    
    summary.totalRequests = successRequests.length + errorRequests.length;
    
    if (successRequests.length > 0) {
      summary.avgRequestTime = successRequests.reduce((sum, req) => sum + req.duration, 0) / successRequests.length;
    }
    
    if (summary.totalRequests > 0) {
      summary.errorRate = (errorRequests.length / summary.totalRequests) * 100;
    }
    
    // 计算页面导航统计
    const navigationMetrics = Object.keys(this.metrics).filter(key => 
      key.startsWith('navigate_') || key.startsWith('redirect_') || key.startsWith('switchTab_')
    );
    
    const allNavigations = navigationMetrics.reduce((all, key) => {
      return all.concat(this.metrics[key]);
    }, []);
    
    summary.pageNavigations = allNavigations.length;
    
    if (allNavigations.length > 0) {
      summary.avgPageLoadTime = allNavigations.reduce((sum, nav) => sum + nav.duration, 0) / allNavigations.length;
    }
    
    return summary;
  }
  
  /**
   * 导出数据
   */
  exportData() {
    return {
      metrics: this.metrics,
      logs: this.logs,
      report: this.getReport()
    };
  }
  
  /**
   * 清除数据
   */
  clear() {
    this.metrics = {};
    this.timers = {};
    this.logs = [];
  }
  
  /**
   * 启用/禁用监控
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

/**
 * 辅助函数
 */
export const perf = {
  // 开始计时
  start: (name) => performanceMonitor.startTimer(name),
  
  // 结束计时
  end: (name) => performanceMonitor.endTimer(name),
  
  // 记录指标
  record: (name, data) => performanceMonitor.recordMetric(name, data),
  
  // 获取报告
  getReport: () => performanceMonitor.getReport(),
  
  // 导出数据
  export: () => performanceMonitor.exportData(),
  
  // 清除数据
  clear: () => performanceMonitor.clear(),
  
  // 启用/禁用
  setEnabled: (enabled) => performanceMonitor.setEnabled(enabled)
};

export default performanceMonitor;
