// store/modules/checkin.js
// 打卡模块状态管理

export default {
  namespaced: true,
  
  state: {
    // 打卡记录
    checkins: [],
    // 统计数据
    stats: {
      total: 0,
      continuous: 0,
      thisWeek: 0
    },
    // 今日打卡状态
    hasCheckedToday: false,
    // 加载状态
    loading: false,
    // 错误信息
    error: null
  },
  
  mutations: {
    SET_CHECKINS(state, checkins) {
      state.checkins = checkins;
    },
    
    SET_STATS(state, stats) {
      state.stats = { ...state.stats, ...stats };
    },
    
    SET_TODAY_STATUS(state, status) {
      state.hasCheckedToday = status;
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    ADD_CHECKIN(state, checkin) {
      state.checkins.unshift(checkin);
      state.hasCheckedToday = true;
    },
    
    UPDATE_CHECKIN_LIKES(state, { index, likes }) {
      if (state.checkins[index]) {
        state.checkins[index].likes = likes;
      }
    }
  },
  
  actions: {
    // 加载打卡记录
    async loadCheckins({ commit }, { supabaseApi, currentUser }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const response = await supabaseApi.getCheckins();
        
        if (response.success) {
          const checkins = response.data.map(item => ({
            id: item.id,
            name: item.user_profile?.nickname || '用户',
            content: item.content,
            time: item.created_at,
            likes: item.likes || 0,
            user_id: item.user_id
          }));
          
          commit('SET_CHECKINS', checkins);
          
          // 检查今日打卡状态
          if (currentUser) {
            const today = new Date().toDateString();
            const hasCheckedToday = checkins.some(checkin => 
              checkin.user_id === currentUser.id && 
              new Date(checkin.time).toDateString() === today
            );
            commit('SET_TODAY_STATUS', hasCheckedToday);
          }
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
        console.error('加载打卡记录失败:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // 加载统计数据
    async loadStats({ commit }, { supabaseApi, userId }) {
      try {
        if (!userId) return;
        
        const response = await supabaseApi.getUserCheckinStats(userId);
        
        if (response.success) {
          commit('SET_STATS', {
            total: response.data.total || 0,
            continuous: response.data.continuous || 0,
            thisWeek: response.data.thisWeek || 0
          });
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    },
    
    // 提交打卡
    async submitCheckin({ commit, dispatch }, { supabaseApi, content, currentUser }) {
      try {
        const response = await supabaseApi.createCheckin({
          content: content.trim(),
          checkin_date: new Date().toISOString().split('T')[0]
        });
        
        if (response.success) {
          // 添加新打卡记录到本地状态
          const newCheckin = {
            id: response.data.id,
            name: currentUser?.nickname || '用户',
            content: content.trim(),
            time: new Date().toISOString(),
            likes: 0,
            user_id: currentUser?.id
          };
          
          commit('ADD_CHECKIN', newCheckin);
          
          // 重新加载统计数据
          if (currentUser) {
            await dispatch('loadStats', { supabaseApi, userId: currentUser.id });
          }
          
          return { success: true };
        } else {
          throw new Error(response.error || '打卡失败');
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
        return { success: false, error: error.message };
      }
    },
    
    // 点赞打卡
    async likeCheckin({ commit }, { supabaseApi, checkinId, index }) {
      try {
        // 这里可以调用API更新点赞
        // const response = await supabaseApi.likeCheckin(checkinId);
        
        // 暂时模拟点赞成功
        const currentLikes = this.state.checkin.checkins[index]?.likes || 0;
        commit('UPDATE_CHECKIN_LIKES', { 
          index, 
          likes: currentLikes + 1 
        });
        
        return { success: true };
      } catch (error) {
        console.error('点赞失败:', error);
        return { success: false, error: error.message };
      }
    }
  },
  
  getters: {
    // 获取排序后的打卡记录
    sortedCheckins: (state) => {
      return [...state.checkins].sort((a, b) => new Date(b.time) - new Date(a.time));
    },
    
    // 获取统计数据
    statsData: (state) => [
      {
        icon: '📅',
        value: state.stats.total,
        label: '累计天数',
        color: 'primary',
        highlight: state.stats.total > 0
      },
      {
        icon: '🔥',
        value: state.stats.continuous,
        label: '连续天数',
        color: 'warning',
        change: state.hasCheckedToday ? '+1' : null,
        changeType: 'positive',
        highlight: state.stats.continuous > 7
      },
      {
        icon: '📊',
        value: state.stats.thisWeek,
        label: '本周打卡',
        color: 'success',
        highlight: state.stats.thisWeek >= 5
      }
    ],
    
    // 获取打卡状态
    checkinStatus: (state) => ({
      hasCheckedToday: state.hasCheckedToday,
      statusClass: state.hasCheckedToday ? 'checked' : 'pending',
      statusIcon: state.hasCheckedToday ? '✅' : '⏰',
      statusText: state.hasCheckedToday ? '已打卡' : '待打卡'
    })
  }
};
