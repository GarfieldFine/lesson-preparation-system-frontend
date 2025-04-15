<template>
  <div class="content-area">
    <div class="ai-assistant-section">
      <div class="section-header">
        <h2>AI教学助手</h2>
        <p>智能辅助课程规划与题目设计</p>
      </div>

      <div class="chat-container">
        <div class="chat-messages" ref="messagesContainer">
          <div class="message-date">今天</div>

          <div v-for="(message, idx) in chatMessages" :key="idx"
               :class="['message', message.type]">
            <div class="message-avatar">
              <i v-if="message.type === 'ai'" class="fas fa-robot"></i>
              <img v-else src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="用户头像">
            </div>
            <div class="message-content">
              <div class="message-text" v-html="message.content"></div>
              <div v-if="message.type === 'ai'" class="message-actions">
                <button class="action-btn">
                  <i class="fas fa-copy"></i> 复制
                </button>
                <button class="action-btn">
                  <i class="fas fa-thumbs-up"></i> 有帮助
                </button>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="message ai">
            <div class="message-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-container">
            <textarea
              v-model="aiPrompt"
              placeholder="输入您的问题..."
              @keyup.enter.exact="sendAIPrompt"
              @keyup.enter.shift.exact="aiPrompt += '\n'"
              rows="1"
              ref="promptInput"
            ></textarea>
            <div class="input-actions">
              <button class="action-btn" title="上传文件">
                <i class="fas fa-paperclip"></i>
              </button>
              <button class="action-btn" title="插入图片">
                <i class="fas fa-image"></i>
              </button>
            </div>
          </div>
          <button class="send-btn" @click="sendAIPrompt" :disabled="!aiPrompt.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';

const aiPrompt = ref('');
const isTyping = ref(false);
const messagesContainer = ref(null);
const promptInput = ref(null);

const chatMessages = ref([
  {
    type: 'ai',
    content: '你好！我是你的AI教学助手。我可以帮你：<br>1. 智能出题和题目优化<br>2. 课程内容规划建议<br>3. 教学方法推荐<br>4. 答疑解惑'
  },
  {
    type: 'user',
    content: '帮我生成一道关于链表的题目'
  },
  {
    type: 'ai',
    content: '好的，这是一道关于链表的题目：<br><br>链表的优点是：<br>A. 随机访问效率高<br>B. 占用内存空间小<br>C. 插入和删除操作灵活'
  }

]);

const sendAIPrompt = async () => {
  if (!aiPrompt.value.trim()) return;

  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: aiPrompt.value.replace(/\n/g, '<br>')
  });

  // 清空输入框
  aiPrompt.value = '';

  // 自动调整输入框高度
  adjustTextareaHeight();

  // 滚动到底部
  await scrollToBottom();

  // 显示AI正在输入状态
  isTyping.value = true;
  await scrollToBottom();

  // 模拟AI响应延迟
  setTimeout(async () => {
    isTyping.value = false;

    // 添加AI响应
    chatMessages.value.push({
      type: 'ai',
      content: '我理解你的问题，让我思考一下...'
    });

    await scrollToBottom();
  }, 1500);
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const adjustTextareaHeight = () => {
  if (promptInput.value) {
    promptInput.value.style.height = 'auto';
    promptInput.value.style.height = promptInput.value.scrollHeight + 'px';
  }
};

watch(() => aiPrompt.value, () => {
  adjustTextareaHeight();
});

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.content-area {
  padding: 24px;
  background: #f8fafc;
  height: calc(100vh - 100px);
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.section-header p {
  color: #64748b;
}

.chat-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.message-date {
  text-align: center;
  margin: 16px 0;
  color: #64748b;
  font-size: 14px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.message.ai {
  flex-direction: row;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message.ai .message-content {
  background: #f8fafc;
  color: #1e293b;
}

.message.user .message-content {
  background: #0284c7;
  color: white;
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  border-radius: 4px;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #0284c7;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.input-container {
  flex: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-end;
}

textarea {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  max-height: 120px;
  font-size: 14px;
  line-height: 1.5;
  padding: 4px 0;
}

.input-actions {
  display: flex;
  gap: 8px;
  padding-left: 8px;
  border-left: 1px solid #e2e8f0;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #0284c7;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #0369a1;
}

.send-btn:disabled {
  background: #e2e8f0;
  cursor: not-allowed;
}
</style>
