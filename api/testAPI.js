// api/testAPI.js - API测试辅助函数

import GroupAPI from './groupAPI';
import { supabaseConfig } from '../config/supabase';

/**
 * API测试工具
 */
class TestAPI {
  /**
   * 全面测试群组API
   */
  static async testGroupAPI() {
    console.log('[测试] 开始测试群组API');
    
    try {
      // 测试1：健康检查
      console.log('[测试] 测试健康检查...');
      const healthCheck = await GroupAPI.testConnection();
      console.log('[测试] 健康检查结果:', healthCheck);
      
      // 测试2：数据库连接
      console.log('[测试] 测试数据库连接...');
      const dbCheck = await GroupAPI.testConnection(true);
      console.log('[测试] 数据库连接测试结果:', dbCheck);
      
      return {
        success: true,
        message: '群组API测试完成',
        healthCheck,
        dbCheck
      };
    } catch (error) {
      console.error('[测试] 群组API测试失败:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }
  
  /**
   * 测试 Supabase 连接
   */
  static async testSupabaseConnection() {
    console.log('[测试] 开始测试 Supabase 连接');
    
    try {
      // 导入 SupabaseConnection
      const { default: SupabaseConnection } = await import('./supabaseConnection');
      
      // 创建实例
      const supabase = new SupabaseConnection();
      supabase.config = supabaseConfig || supabase.config;
      
      // 测试连接
      const result = await supabase.testConnection();
      console.log('[测试] Supabase连接测试结果:', result);
      
      return {
        success: result.success,
        message: '连接测试完成',
        method: result.method,
        data: result.data
      };
    } catch (error) {
      console.error('[测试] Supabase连接测试失败:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }
}

export default TestAPI;
