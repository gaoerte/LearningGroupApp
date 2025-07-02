// utils/performance-safe.js
// 安全的性能监控工具 - 避免递归调用

/**
 * 安全的性能监控管理器
 */
class SafePerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.timers = {};
    this.logs = [];
    this.isEnabled = true;
    this.initialized = false;
    this.isMonitoring = false;
    
    // 安全初始化
    this.safeInit();
  }
  
  /**
   * 安全初始化
   */
  safeInit() {
    if (this.initialized) return;
    
    try {
      this.initialized = true;
      console.log('🔧 安全性能监控器已初始化');
    } catch (error) {
      console.warn('性能监控器初始化失败:', error);
    }
  }
  
  /**
   * 开始计时
   */
  start(name) {
    if (!this.isEnabled || this.isMonitoring) return;
    
    try {
      this.timers[name] = {
        start: Date.now(),
        name
      };
    } catch (error) {
      console.warn(`计时器启动失败 ${name}:`, error);
    }
  }
  
  /**
   * 结束计时
   */
  end(name) {
    if (!this.isEnabled || this.isMonitoring || !this.timers[name]) return 0;
    
    try {
      const timer = this.timers[name];
      const duration = Date.now() - timer.start;
      
      this.safeRecordMetric(name, {
        type: 'timing',
        duration,
        timestamp: new Date().toISOString()
      });
      
      delete this.timers[name];
      return duration;
    } catch (error) {
      console.warn(`计时器结束失败 ${name}:`, error);
      return 0;
    }
  }
  
  /**
   * 安全记录指标
   */
  safeRecordMetric(name, data) {
    if (!this.isEnabled || this.isMonitoring) return;
    
    try {
      // 设置监控标志，防止递归
      this.isMonitoring = true;
      
      if (!this.metrics[name]) {
        this.metrics[name] = [];
      }
      
      this.metrics[name].push({
        ...data,
        timestamp: new Date().toISOString()
      });
      
      // 保持最近50条记录（减少内存使用）
      if (this.metrics[name].length > 50) {
        this.metrics[name] = this.metrics[name].slice(-50);
      }
      
    } catch (error) {
      console.warn(`记录指标失败 ${name}:`, error);
    } finally {
      this.isMonitoring = false;
    }
  }
  
  /**
   * 获取性能报告
   */
  getReport() {
    if (this.isMonitoring) return null;
    
    try {
      this.isMonitoring = true;
      
      const report = {
        timestamp: new Date().toISOString(),
        metrics: { ...this.metrics },
        summary: {
          totalMetrics: Object.keys(this.metrics).length,
          activeTimers: Object.keys(this.timers).length,
          isEnabled: this.isEnabled
        }
      };
      
      return report;
    } catch (error) {
      console.warn('生成性能报告失败:', error);
      return null;
    } finally {
      this.isMonitoring = false;
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    try {
      this.isMonitoring = true;
      this.metrics = {};
      this.timers = {};
      this.logs = [];
      console.log('🧹 性能监控器已清理');
    } catch (error) {
      console.warn('性能监控器清理失败:', error);
    } finally {
      this.isMonitoring = false;
    }
  }
  
  /**
   * 启用/禁用监控
   */
  setEnabled(enabled) {
    this.isEnabled = !!enabled;
    console.log(`🔧 性能监控器已${this.isEnabled ? '启用' : '禁用'}`);
  }
  
  /**
   * 导出数据
   */
  export() {
    if (this.isMonitoring) return {};
    
    try {
      return {
        metrics: { ...this.metrics },
        timers: { ...this.timers },
        enabled: this.isEnabled,
        exportTime: new Date().toISOString()
      };
    } catch (error) {
      console.warn('导出性能数据失败:', error);
      return {};
    }
  }
}

// 创建安全的性能监控实例
const safePerf = new SafePerformanceMonitor();

// 导出
export { SafePerformanceMonitor, safePerf };
export default safePerf;
