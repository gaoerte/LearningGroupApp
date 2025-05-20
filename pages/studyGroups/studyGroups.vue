<template>
    <view class="container">
        <text class="title">已加入的群组</text>

        <!-- 群组列表 -->
        <view class="group-list">
            <view class="group-item" v-for="(group, index) in joinedGroups" :key="index">
                <text class="group-name">{{ group.name }}</text>
                <text class="group-description">{{ group.description }}</text>
                <button class="enter-btn" @click="enterGroupChat(group)">进入群聊</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            // 用户已加入的群组数据
            joinedGroups: [
                { name: '数学学习小组', description: '一起学习高等数学', id: 1 },
                { name: '英语学习小组', description: '共同提高英语听说能力', id: 2 },
                { name: '编程学习小组', description: '编程从入门到精通', id: 3 }
            ]
        };
    },
    methods: {
        // 进入群组聊天
        enterGroupChat(group) {
            uni.navigateTo({
                url: `/pages/groupChat/groupChat?groupId=${group.id}`
            });
        }
    }
};
</script>

<style scoped>
.container {
    padding: 20px;
}

.title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
}

.group-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.group-item {
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.group-name {
    font-size: 18px;
    font-weight: bold;
}

.group-description {
    color: #777;
    margin-bottom: 10px;
}

.enter-btn {
    width: 100%;
    padding: 10px;
    background-color: #1aad19;
    color: white;
    border: none;
    border-radius: 5px;
}
</style>
