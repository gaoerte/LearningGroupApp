<template>
    <view class="container">
        <!-- 欢迎信息 -->
        <text class="welcome-text">欢迎回来，小明</text>

        <!-- 三个功能按钮 -->
        <view class="buttons">
            <button @click="goToCheckin">打卡</button>
            <button @click="goToGroupMatch">小组匹配</button>
            <button @click="goToAIChat">AI聊天</button>
        </view>
    </view>
</template>

<script>
export default {
    methods: {
        // 打卡
        goToCheckin() {
            uni.navigateTo({
                url: '/pages/checkin/checkin'
            });
        },
        // 小组匹配
        goToGroupMatch() {
            uni.navigateTo({
                url: '/pages/groupMatch/groupMatch'
            });
        },
        // AI聊天
        goToAIChat() {
            uni.navigateTo({
                url: '/pages/aichat/aichat'
            });
        },
        // 跳转到首页
        goToHome() {
            uni.switchTab({
                url: '/pages/index/index'  // 使用 switchTab 跳转到首页
            });
        },
        // 跳转到学习群组
        goToStudyGroups() {
            uni.switchTab({
                url: '/pages/studyGroups/studyGroups'  // 使用 switchTab 跳转到学习群组
            });
        },
        // 跳转到个人中心
        goToPersonalCenter() {
            uni.switchTab({
                url: '/pages/personalCenter/personalCenter'  // 使用 switchTab 跳转到个人中心
            });
        }
    }
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    padding: 20px;
}

.welcome-text {
    font-size: 24px;
    text-align: center;
    margin-bottom: 30px;
}

.buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

button {
    padding: 12px;
    font-size: 16px;
    background-color: #1aad19;
    color: white;
    border-radius: 5px;
    border: none;
}
</style>
