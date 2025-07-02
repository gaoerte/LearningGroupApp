<template>
  <scroll-view 
    class="test-scroll-container" 
    scroll-y 
    :refresher-enabled="true"
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
    @refresherrestore="onRestore"
  >
    <view class="test-container">
      <modern-card class="test-card" shadow="medium">
        <view class="test-header">
          <text class="test-title">🔧 Supabase 后端测试</text>
          <text class="test-subtitle">验证数据库连接和 API 功能</text>
        </view>

        <!-- 连接状态 -->
        <view class="status-section">
          <view class="status-item">
            <text class="status-label">连接状态:</text>
            <text class="status-value" :class="connectionStatus.class">
              {{ connectionStatus.text }}
            </text>
          </view>
        </view>

        <!-- 测试按钮组 -->
        <view class="test-actions">
          <modern-button 
            type="primary" 
            size="medium"
            @click="testConnection"
            :loading="testing.connection"
          >
            测试连接
          </modern-button>

          <modern-button 
            type="default" 
            size="medium"
            @click="testUserAPI"
            :loading="testing.user"
          >
            测试用户API
          </modern-button>

          <modern-button 
            type="default" 
            size="medium"
            @click="testCheckinAPI"
            :loading="testing.checkin"
          >
            测试打卡API
          </modern-button>

          <modern-button 
            type="default" 
            size="medium"
            @click="testGroupAPI"
            :loading="testing.group"
          >
            测试群组API
          </modern-button>

          <modern-button 
            type="default" 
            size="medium"
            @click="runFullTestSuite"
            :loading="testing.fullSuite"
          >
            运行完整测试
          </modern-button>

          <modern-button 
            type="default" 
            size="medium"
            @click="quickHealthCheck"
            :loading="testing.healthCheck"
          >
            快速健康检查
          </modern-button>

          <modern-button 
            type="warning" 
            size="medium"
            @click="viewPerformanceReport"
          >
            性能报告
          </modern-button>

          <modern-button 
            type="info" 
            size="medium"
            @click="showDevTools"
          >
            开发工具
          </modern-button>

          <modern-button 
            type="secondary" 
            size="medium"
            @click="clearResults"
          >
            清除结果
          </modern-button>
        </view>

        <!-- 测试结果 -->
        <view class="test-results" v-if="testResults.length > 0">
          <view class="results-header">
            <text class="results-title">📊 测试结果</text>
          </view>
          
          <scroll-view class="results-list" scroll-y>
            <view 
              v-for="(result, index) in testResults" 
              :key="index"
              class="result-item"
              :class="result.status"
            >
              <view class="result-header">
                <text class="result-name">{{ result.name }}</text>
                <text class="result-time">{{ formatTime(result.timestamp) }}</text>
              </view>
              <text class="result-message">{{ result.message }}</text>
              <view class="result-status" :class="result.status">
                {{ result.success ? '✅ 成功' : '❌ 失败' }}
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <text class="empty-text">点击上方按钮开始测试</text>
        </view>
      </modern-card>
    </view>
  </scroll-view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import { userAPI, checkinAPI, studyGroupAPI, supabaseUtils } from '../../api/supabase-v2.js'
// 使用安全版本的工具模块
import { safeTestAPI } from '../../utils/apiTester-safe.js'
import { safePerf } from '../../utils/performance-safe.js'

export default {
  components: {
    ModernCard,
    ModernButton
  },
  data() {
    return {
      refreshing: false,
      connectionStatus: {
        text: '未测试',
        class: 'status-unknown'
      },
      testing: {
        connection: false,
        user: false,
        checkin: false,
        group: false,
        fullSuite: false,
        healthCheck: false
      },
      testResults: []
    }
  },
  mounted() {
    // 页面挂载后的初始化
    this.initializePage()
  },
  methods: {
    // 初始化页面
    initializePage() {
      try {
        console.log('🔧 Supabase 测试页面初始化完成')
        
        // 设置基础状态
        this.connectionStatus = {
          text: '未测试',
          class: 'status-unknown'
        }
        
        // 显示初始化完成提示
        setTimeout(() => {
          uni.showToast({
            title: '测试页面已就绪',
            icon: 'success',
            duration: 1500
          })
        }, 500)
        
      } catch (error) {
        console.error('页面初始化失败:', error)
        uni.showToast({
          title: '页面加载失败',
          icon: 'error'
        })
      }
    },

    // 安全执行测试方法
    async safeExecuteTest(testName, testMethod) {
      // 防止重复执行
      const testKey = testName.toLowerCase().replace(/[^a-z]/g, '')
      if (this.testing[testKey]) {
        uni.showToast({
          title: '测试正在进行中',
          icon: 'none'
        })
        return
      }
      
      try {
        await testMethod()
      } catch (error) {
        console.error(`${testName}执行失败:`, error)
        
        // 确保测试状态被重置
        Object.keys(this.testing).forEach(key => {
          this.testing[key] = false
        })
        
        uni.showToast({
          title: '测试执行失败',
          icon: 'error'
        })
      }
    },

    // 测试连接
    async testConnection() {
      await this.safeExecuteTest('连接测试', async () => {
        this.testing.connection = true
        this.addResult('连接测试', false, '测试中...')
        
        try {
          const result = await supabaseUtils.healthCheck()
          
          if (result.success) {
            this.connectionStatus = {
              text: '连接正常',
              class: 'status-success'
            }
            this.updateResult('连接测试', true, '云函数连接正常')
          } else {
            this.connectionStatus = {
              text: '连接失败',
              class: 'status-error'
            }
            this.updateResult('连接测试', false, result.error)
          }
        } catch (error) {
          this.connectionStatus = {
            text: '连接错误',
            class: 'status-error'
          }
          this.updateResult('连接测试', false, error.message)
        } finally {
          this.testing.connection = false
        }
      })
    },

    // 测试用户API
    async testUserAPI() {
      await this.safeExecuteTest('用户API', async () => {
        this.testing.user = true
        this.addResult('用户API', false, '测试中...')
        
        try {
          const results = await safeTestAPI.runUserAPITests()
          
          if (results && results.length > 0) {
            const successCount = results.filter(r => r.status === 'success').length
            this.updateResult('用户API', true, 
              `完成 ${results.length} 项测试，成功 ${successCount} 项`)
          } else {
            this.updateResult('用户API', false, '测试结果为空')
          }
        } catch (error) {
          this.updateResult('用户API', false, error.message)
        } finally {
          this.testing.user = false
        }
      })
    },

    // 测试打卡API
    async testCheckinAPI() {
      await this.safeExecuteTest('打卡API', async () => {
        this.testing.checkin = true
        this.addResult('打卡API', false, '测试中...')
        
        try {
          const results = await safeTestAPI.runCheckinAPITests()
          
          if (results && results.length > 0) {
            const successCount = results.filter(r => r.status === 'success').length
            this.updateResult('打卡API', true, 
              `完成 ${results.length} 项测试，成功 ${successCount} 项`)
          } else {
            this.updateResult('打卡API', false, '测试结果为空')
          }
        } catch (error) {
          this.updateResult('打卡API', false, error.message)
        } finally {
          this.testing.checkin = false
        }
      })
    },

    // 测试群组API
    async testGroupAPI() {
      await this.safeExecuteTest('群组API', async () => {
        this.testing.group = true
        this.addResult('群组API', false, '测试中...')
        
        try {
          const results = await safeTestAPI.runGroupAPITests()
          
          if (results && results.length > 0) {
            const successCount = results.filter(r => r.status === 'success').length
            this.updateResult('群组API', true, 
              `完成 ${results.length} 项测试，成功 ${successCount} 项`)
          } else {
            this.updateResult('群组API', false, '测试结果为空')
          }
        } catch (error) {
          this.updateResult('群组API', false, error.message)
        } finally {
          this.testing.group = false
        }
      })
    },

    // 运行完整测试套件
    async runFullTestSuite() {
      await this.safeExecuteTest('完整测试套件', async () => {
        this.testing.fullSuite = true
        this.addResult('完整测试套件', false, '执行中...')
        
        try {
          console.log('🚀 开始完整测试套件')
          safePerf.start('full_test_suite')
          
          const report = await safeTestAPI.runFullTestSuite()
          
          const duration = safePerf.end('full_test_suite')
          
          this.updateResult('完整测试套件', true, 
            `测试完成: 总计${report.summary.total}个，成功率${report.summary.successRate}，耗时${duration}ms`)
          
          // 显示详细报告
          this.showTestReport(report)
          
        } catch (error) {
          this.updateResult('完整测试套件', false, error.message)
          console.error('完整测试套件失败:', error)
        } finally {
          this.testing.fullSuite = false
        }
      })
    },

    // 快速健康检查
    async quickHealthCheck() {
      await this.safeExecuteTest('健康检查', async () => {
        this.testing.healthCheck = true
        this.addResult('健康检查', false, '检查中...')
        
        try {
          const healthReport = await safeTestAPI.healthCheck()
          
          if (healthReport.status === 'healthy') {
            this.updateResult('健康检查', true, `所有服务正常 (成功率: ${healthReport.successRate})`)
          } else {
            this.updateResult('健康检查', false, `部分服务异常 (成功率: ${healthReport.successRate})`)
          }
          
        } catch (error) {
          this.updateResult('健康检查', false, error.message)
          console.error('健康检查失败:', error)
        } finally {
          this.testing.healthCheck = false
        }
      })
    },

    // 查看性能报告
    viewPerformanceReport() {
      try {
        const report = safePerf.getReport()
        
        if (report) {
          uni.showModal({
            title: '性能报告',
            content: `指标数量: ${report.summary.totalMetrics}\n活跃计时器: ${report.summary.activeTimers}\n状态: ${report.summary.isEnabled ? '启用' : '禁用'}`,
            showCancel: false
          })
        } else {
          uni.showToast({
            title: '无性能数据',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('查看性能报告失败:', error)
        uni.showToast({
          title: '获取报告失败',
          icon: 'error'
        })
      }
    },

    // 显示开发工具
    showDevTools() {
      const actions = ['清理性能数据', '导出测试结果', '重置连接状态', '取消']
      
      uni.showActionSheet({
        itemList: actions.slice(0, -1),
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.cleanupPerformanceData()
              break
            case 1:
              this.exportTestResults()
              break
            case 2:
              this.resetConnectionStatus()
              break
          }
        }
      })
    },

    // 清理性能数据
    cleanupPerformanceData() {
      try {
        safePerf.cleanup()
        safeTestAPI.cleanup()
        uni.showToast({
          title: '清理完成',
          icon: 'success'
        })
      } catch (error) {
        console.error('清理失败:', error)
        uni.showToast({
          title: '清理失败',
          icon: 'error'
        })
      }
    },

    // 导出测试结果
    exportTestResults() {
      try {
        const exportData = {
          timestamp: new Date().toISOString(),
          testResults: this.testResults,
          connectionStatus: this.connectionStatus,
          performanceReport: safePerf.export(),
          apiTestResults: safeTestAPI.getResults()
        }
        
        // 在控制台输出，便于复制
        console.log('📊 测试结果导出:', JSON.stringify(exportData, null, 2))
        
        uni.showToast({
          title: '已输出到控制台',
          icon: 'success'
        })
      } catch (error) {
        console.error('导出失败:', error)
        uni.showToast({
          title: '导出失败',
          icon: 'error'
        })
      }
    },

    // 重置连接状态
    resetConnectionStatus() {
      this.connectionStatus = {
        text: '未测试',
        class: 'status-unknown'
      }
      uni.showToast({
        title: '状态已重置',
        icon: 'success'
      })
    },

    // 显示测试报告
    showTestReport(report) {
      try {
        const content = `总测试: ${report.summary.total}\n成功: ${report.summary.success}\n警告: ${report.summary.warning}\n失败: ${report.summary.error}\n成功率: ${report.summary.successRate}`
        
        uni.showModal({
          title: '测试报告',
          content,
          showCancel: false
        })
      } catch (error) {
        console.warn('显示测试报告失败:', error)
      }
    },

    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      setTimeout(() => {
        this.refreshing = false
        uni.showToast({
          title: '页面已刷新',
          icon: 'success'
        })
      }, 1000)
    },

    // 刷新恢复
    onRestore() {
      this.refreshing = false
    },

    // 清除结果
    clearResults() {
      this.testResults = []
      this.connectionStatus = {
        text: '未测试',
        class: 'status-unknown'
      }
      
      // 重置所有测试状态
      Object.keys(this.testing).forEach(key => {
        this.testing[key] = false
      })
      
      uni.showToast({
        title: '结果已清除',
        icon: 'success'
      })
    },

    // 添加测试结果
    addResult(name, success, message) {
      this.testResults.push({
        name,
        success,
        message,
        status: success ? 'success' : 'testing',
        timestamp: new Date()
      })
    },

    // 更新测试结果
    updateResult(name, success, message) {
      const index = this.testResults.findIndex(r => r.name === name)
      if (index >= 0) {
        this.testResults[index] = {
          ...this.testResults[index],
          success,
          message,
          status: success ? 'success' : 'error',
          timestamp: new Date()
        }
      }
    },

    // 格式化时间
    formatTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleTimeString()
    }
  }
}
</script>

<style scoped>
.test-scroll-container {
  height: 100vh;
  background: var(--bg-color-page);
}

.test-container {
  padding: var(--spacing-md);
  min-height: calc(100vh - var(--spacing-md) * 2);
}

.test-card {
  width: 100%;
}

.test-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.test-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.test-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
  display: block;
}

.status-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-color-light);
  border-radius: var(--border-radius-md);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: var(--font-size-base);
  color: var(--text-color-primary);
}

.status-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.status-unknown {
  color: var(--color-warning);
}

.status-success {
  color: var(--color-success);
}

.status-error {
  color: var(--color-danger);
}

.test-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.test-results {
  margin-top: var(--spacing-lg);
}

.results-header {
  margin-bottom: var(--spacing-md);
}

.results-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
}

.results-list {
  max-height: 400px;
}

.result-item {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--bg-color-light);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--color-border);
}

.result-item.success {
  border-left-color: var(--color-success);
}

.result-item.error {
  border-left-color: var(--color-danger);
}

.result-item.testing {
  border-left-color: var(--color-warning);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.result-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
}

.result-time {
  font-size: var(--font-size-xs);
  color: var(--text-color-secondary);
}

.result-message {
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
  line-height: 1.4;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.result-status {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.result-status.success {
  color: var(--color-success);
}

.result-status.error {
  color: var(--color-danger);
}

.result-status.testing {
  color: var(--color-warning);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
}

/* 响应式适配 */
@media (max-width: 750px) {
  .test-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .test-actions {
    grid-template-columns: 1fr;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
