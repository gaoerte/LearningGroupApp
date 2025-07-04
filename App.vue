<template>
	<view id="app">
		<!-- 全局样式和初始化逻辑放在这里 -->
	</view>
</template>

<script>
	import { initCloud } from './config/cloud.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 初始化云开发环境
			this.initCloudEnvironment()
		},
		onShow: function() {
			console.log('App Show')
			// 应用显示时的逻辑
		},
		onHide: function() {
			console.log('App Hide')
			// 应用隐藏时的逻辑
		},
		methods: {
			/**
			 * 初始化云开发环境
			 */
			async initCloudEnvironment() {
				try {
					const result = await initCloud()
					if (result) {
						console.log('[App] 云开发初始化成功')
						
						// 可以在这里执行需要云开发的初始化逻辑
						// 比如检查用户登录状态等
						
					} else {
						console.log('[App] 当前环境不需要云开发')
					}
				} catch (error) {
					console.error('[App] 云开发初始化失败:', error)
					
					// 显示用户友好的错误提示
					uni.showToast({
						title: '云服务初始化失败，请检查网络连接',
						icon: 'none',
						duration: 3000
					})
				}
			}
		}
	}
</script>

<style>
	/* 全局样式 */
	@import './uni.scss';
	
	#app {
		font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
	}
	
	/* 通用样式 */
	.container {
		padding: 20rpx;
	}
	
	.flex {
		display: flex;
	}
	
	.flex-1 {
		flex: 1;
	}
	
	.justify-center {
		justify-content: center;
	}
	
	.align-center {
		align-items: center;
	}
	
	.text-center {
		text-align: center;
	}
</style>
