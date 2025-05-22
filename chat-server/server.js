const WebSocket = require('ws');

// WebSocket服务器
const wss = new WebSocket.Server({ port: 3000 });

// 用一个对象管理群组和群组成员
const groups = {}; // 格式 { groupId: Set<ws> }

wss.on('connection', (ws) => {
  let currentGroup = null;

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message); // 解析消息
    } catch (e) {
      console.log('无效消息');
      return;
    }

    // 登录事件
    if (data.type === 'login') {
      currentGroup = data.groupId; // 记录用户所属群组

      // 确保群组存在，如果没有，创建它
      if (!groups[currentGroup]) {
        groups[currentGroup] = new Set(); // 群组成员集合
      }

      groups[currentGroup].add(ws); // 将当前用户加入群组
    }

    // 发送消息事件
    if (data.type === 'message') {
      if (currentGroup) {
        // 群聊消息，广播给群组内所有人
        broadcastToGroup(currentGroup, data);
      }
    }
  });

  ws.on('close', () => {
    // 移除用户连接
    if (currentGroup && groups[currentGroup]) {
      groups[currentGroup].delete(ws);
    }
  });
});

// 向群组内所有成员广播消息
function broadcastToGroup(groupId, data) {
  if (!groups[groupId]) return;

  // 发送给群组成员
  groups[groupId].forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log('WebSocket服务器启动，监听端口3000');