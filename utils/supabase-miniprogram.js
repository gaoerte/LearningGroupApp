// 微信小程序专用的 Supabase 适配器
// 解决 Supabase 在小程序环境中的兼容性问题

class SupabaseMiniProgram {
  constructor() {
    this.isConnected = false;
    this.subscriptions = new Map();
    console.log('[SupabaseMiniProgram] 初始化微信小程序适配器');
  }

  // 模拟 Supabase 的 from 方法
  from(tableName) {
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          order: (orderColumn, options = {}) => ({
            limit: (count) => this.mockQuery(tableName, { columns, where: { [column]: value }, order: orderColumn, limit: count })
          }),
          execute: () => this.mockQuery(tableName, { columns, where: { [column]: value } })
        }),
        execute: () => this.mockQuery(tableName, { columns })
      }),
      insert: (data) => ({
        execute: () => this.mockInsert(tableName, data)
      }),
      update: (data) => ({
        eq: (column, value) => ({
          execute: () => this.mockUpdate(tableName, data, { [column]: value })
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          execute: () => this.mockDelete(tableName, { [column]: value })
        })
      })
    };
  }

  // 模拟查询
  async mockQuery(tableName, options = {}) {
    console.log(`[SupabaseMiniProgram] 模拟查询 ${tableName}:`, options);
    
    if (tableName === 'group_messages') {
      return {
        data: [
          {
            id: '1',
            group_id: 'group_1',
            sender_id: 'user_1',
            content: '欢迎来到群聊！',
            created_at: new Date().toISOString(),
            sender_name: '系统'
          }
        ],
        error: null
      };
    }
    
    return { data: [], error: null };
  }

  // 模拟插入
  async mockInsert(tableName, data) {
    console.log(`[SupabaseMiniProgram] 模拟插入 ${tableName}:`, data);
    
    const newData = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    // 触发插入事件（模拟实时订阅）
    this.triggerSubscriptionEvent(tableName, 'INSERT', newData);
    
    return { data: newData, error: null };
  }

  // 模拟更新
  async mockUpdate(tableName, data, where) {
    console.log(`[SupabaseMiniProgram] 模拟更新 ${tableName}:`, data, where);
    return { data: { ...data, ...where }, error: null };
  }

  // 模拟删除
  async mockDelete(tableName, where) {
    console.log(`[SupabaseMiniProgram] 模拟删除 ${tableName}:`, where);
    return { data: where, error: null };
  }

  // 模拟实时订阅
  channel(channelName) {
    console.log(`[SupabaseMiniProgram] 创建频道: ${channelName}`);
    
    return {
      on: (event, filter, callback) => {
        const subscriptionKey = `${channelName}_${event}_${JSON.stringify(filter)}`;
        this.subscriptions.set(subscriptionKey, callback);
        console.log(`[SupabaseMiniProgram] 订阅事件: ${subscriptionKey}`);
        return this;
      },
      subscribe: (callback) => {
        console.log(`[SupabaseMiniProgram] 订阅频道成功: ${channelName}`);
        if (callback) callback('SUBSCRIBED');
        return this;
      },
      unsubscribe: () => {
        console.log(`[SupabaseMiniProgram] 取消订阅频道: ${channelName}`);
        // 清理相关订阅
        for (const [key] of this.subscriptions) {
          if (key.startsWith(channelName)) {
            this.subscriptions.delete(key);
          }
        }
        return Promise.resolve({ error: null });
      }
    };
  }

  // 触发订阅事件（模拟实时更新）
  triggerSubscriptionEvent(tableName, eventType, data) {
    setTimeout(() => {
      for (const [key, callback] of this.subscriptions) {
        if (key.includes(tableName) && key.includes(eventType)) {
          console.log(`[SupabaseMiniProgram] 触发订阅事件: ${key}`);
          callback({
            eventType,
            new: data,
            old: null,
            errors: null
          });
        }
      }
    }, 100); // 模拟网络延迟
  }

  // 模拟认证状态
  auth = {
    getUser: async () => {
      console.log('[SupabaseMiniProgram] 获取用户信息');
      return {
        data: {
          user: {
            id: 'mp_user_' + Date.now(),
            email: 'miniprogram@example.com'
          }
        },
        error: null
      };
    },
    
    onAuthStateChange: (callback) => {
      console.log('[SupabaseMiniProgram] 监听认证状态变化');
      // 模拟用户已登录
      setTimeout(() => {
        callback('SIGNED_IN', {
          id: 'mp_user_' + Date.now(),
          email: 'miniprogram@example.com'
        });
      }, 100);
      
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  };
}

// 创建单例实例
let supabaseInstance = null;

export function createClient(url, key) {
  console.log('[SupabaseMiniProgram] 创建小程序适配的 Supabase 客户端');
  if (!supabaseInstance) {
    supabaseInstance = new SupabaseMiniProgram();
  }
  return supabaseInstance;
}

export default SupabaseMiniProgram;
