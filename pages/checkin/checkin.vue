<template>
    <view class="container">
        <text class="page-title">打卡</text>

        <!-- 显示其他人的打卡信息 -->
        <view class="other-checkins">
            <text class="section-title">其他人的打卡</text>
            <view class="checkin-item" v-for="(checkin, index) in sortedCheckins" :key="index">
                <text class="checkin-info">{{ checkin.name }}: {{ checkin.content }}</text>
                <text class="checkin-time">{{ checkin.time }}</text>
            </view>
        </view>

        <!-- 今日打卡按钮 -->
        <view class="share-btn">
            <button @click="openCheckinModal" class="checkin-button">今日打卡</button>
        </view>

        <!-- 弹出框，编辑打卡信息 -->
        <view v-if="isModalVisible" class="modal">
            <view class="modal-content">
                <input v-model="newCheckinContent" placeholder="请输入今日打卡内容" class="input" />
                <button @click="submitCheckin" class="submit-button">确定</button>
                <button @click="closeModal" class="cancel-button">取消</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            // 假数据：其他人的打卡信息
            checkins: [
                { name: '小张', content: '学习了 Vue', time: '2025/05/07 09:00:00' },
                { name: '小李', content: '完成了任务', time: '2025/05/07 09:30:00' },
                { name: '小王', content: '复习了代码', time: '2025/05/07 10:00:00' }
            ],
            // 打卡弹出框相关数据
            isModalVisible: false,  // 控制弹出框的显示
            newCheckinContent: ''  // 用户输入的打卡内容
        };
    },
    computed: {
        // 倒序排列打卡信息
        sortedCheckins() {
            return this.checkins.slice().sort((a, b) => new Date(b.time) - new Date(a.time));
        }
    },
    methods: {
        // 打卡按钮点击时打开弹出框
        openCheckinModal() {
            this.isModalVisible = true;
        },
        // 关闭弹出框
        closeModal() {
            this.isModalVisible = false;
        },
        // 提交打卡信息
        submitCheckin() {
            // 获取当前时间，格式化为标准的 24 小时制格式
            const currentTime = this.formatTimeToISO(new Date());

            // 保存新的打卡信息
            this.checkins.unshift({
                name: '我自己',  // 你可以替换成当前用户的名字
                content: this.newCheckinContent || '今天没有打卡内容',
                time: currentTime
            });

            // 清空输入框
            this.newCheckinContent = '';

            // 提示用户打卡成功
            uni.showToast({
                title: '打卡信息已提交',
                icon: 'success'
            });

            // 关闭弹出框
            this.isModalVisible = false;
        },

        // 格式化时间为 ISO 8601 标准格式：yyyy-MM-dd HH:mm:ss
        formatTimeToISO(date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');

            return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
        }
    },
    // 配置分享内容
    onShareAppMessage() {
        return {
            title: '我的今日打卡',
            path: '/pages/checkin/checkin',
            imageUrl: '/static/images/checkin-image.png',  // 可以替换为实际的分享图片
            success(res) {
                console.log('分享成功:', res);
            },
            fail(err) {
                console.log('分享失败:', err);
            }
        };
    }
};
</script>

<style scoped>
.container {
    padding: 20px;
}

.page-title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
}

.other-checkins {
    margin-top: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
}

.checkin-item {
    margin-top: 10px;
    font-size: 16px;
    color: #555;
}

.checkin-info {
    font-weight: bold;
}

.checkin-time {
    font-size: 12px;
    color: #888;
}

.share-btn {
    margin-top: 30px;
    text-align: center;
}

.checkin-button {
    width: 80%;
    padding: 12px;
    background-color: #1aad19;
    color: white;
    border-radius: 5px;
    border: none;
    font-size: 16px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    max-width: 400px;
    text-align: center;
}

.input {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.submit-button,
.cancel-button {
    width: 45%;
    padding: 10px;
    margin: 5px;
    font-size: 16px;
    border-radius: 5px;
}

.submit-button {
    background-color: #1aad19;
    color: white;
    border: none;
}

.cancel-button {
    background-color: #f44336;
    color: white;
    border: none;
}
</style>
