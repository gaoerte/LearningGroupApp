// api/deepseek.js
export const createStreamingChat = async (messages, onDataReceived) => {
  const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

  // 创建中止控制器，方便外部取消请求
  const controller = new AbortController();

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages.slice(-6), // 取最近6条对话
        stream: true,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // 递归读取流数据
    const processChunk = async () => {
      const { done, value } = await reader.read();
      if (done) return;

      buffer += decoder.decode(value, { stream: true });

      // 按行拆分，处理完整行
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留未完成的部分

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = line.replace('data: ', '');
            const data = JSON.parse(jsonData);
            const content = data.choices[0]?.delta?.content;
            if (content) {
              onDataReceived(content);
            }
          } catch (e) {
            console.warn('解析JSON失败:', e);
          }
        }
      }

      return processChunk();
    };

    await processChunk();

    // 返回带 abort 方法的对象，调用方可取消请求
    return {
      abort: () => controller.abort(),
    };

  } catch (error) {
    console.error('流式请求失败:', error);
    throw error;
  }
};