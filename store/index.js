/**
 * 简单的状态管理
 * 用于管理全局状态
 */
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage.js';

class Store {
  constructor() {
    this.state = {
      // 用户相关
      isLoggedIn: false,
      userInfo: null,
      token: null,
      
      // 应用相关
      theme: 'light',
      loading: false,
      
      // 功能相关
      checkinList: [],
      studyGroups: [],
      chatMessages: []
    };
    
    this.listeners = [];
    this.init();
  }
  
  /**
   * 初始化状态
   */
  init() {
    // 从存储中恢复状态
    this.state.token = getStorage(STORAGE_KEYS.TOKEN);
    this.state.userInfo = getStorage(STORAGE_KEYS.USER_INFO);
    this.state.isLoggedIn = !!this.state.token;
    this.state.theme = getStorage(STORAGE_KEYS.THEME, 'light');
    this.state.checkinList = getStorage(STORAGE_KEYS.CHECKIN_DATA, []);
  }
  
  /**
   * 获取状态
   */
  getState() {
    return this.state;
  }
  
  /**
   * 更新状态
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
    
    // 持久化重要状态
    if (newState.userInfo !== undefined) {
      setStorage(STORAGE_KEYS.USER_INFO, newState.userInfo);
    }
    if (newState.token !== undefined) {
      setStorage(STORAGE_KEYS.TOKEN, newState.token);
    }
    if (newState.theme !== undefined) {
      setStorage(STORAGE_KEYS.THEME, newState.theme);
    }
    if (newState.checkinList !== undefined) {
      setStorage(STORAGE_KEYS.CHECKIN_DATA, newState.checkinList);
    }
  }
  
  /**
   * 监听状态变化
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * 通知监听器
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  /**
   * 登录
   */
  login(userInfo, token) {
    this.setState({
      isLoggedIn: true,
      userInfo,
      token
    });
  }
  
  /**
   * 登出
   */
  logout() {
    this.setState({
      isLoggedIn: false,
      userInfo: null,
      token: null
    });
  }
  
  /**
   * 添加打卡记录
   */
  addCheckin(checkinData) {
    const checkinList = [...this.state.checkinList, checkinData];
    this.setState({ checkinList });
  }
  
  /**
   * 设置加载状态
   */
  setLoading(loading) {
    this.setState({ loading });
  }
}

// 创建全局store实例
const store = new Store();

// 导出store实例
export default store;
