<template>
  <div class="smart-customer-service">
    <h1>智能客服系统</h1>
    
    <!-- 主内容区域 -->
    <el-row :gutter="20">
      <!-- 左侧：对话历史和语音输入 -->
      <el-col :span="12">
        <!-- 对话历史区域 -->
        <el-card class="chat-box">
          <template #header>
            <h2>对话历史</h2>
          </template>
          
          <div class="message-container">
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              :class="['message', message.role === 'user' ? 'user-message' : 'bot-message']"
            >
              {{ message.text }}
            </div>
          </div>
          
          <el-input 
            v-model="inputText" 
            placeholder="请输入消息" 
            @keyup.enter="sendText"
          >
            <template #append>
              <el-button @click="sendText">发送</el-button>
            </template>
          </el-input>
        </el-card>
        
        <!-- 语音输入区域 -->
        <el-card class="voice-control">
          <template #header>
            <h2>系统声音录制</h2>
          </template>
          
          <div class="status">{{ voiceStatus }}</div>
          
          <div class="button-group">
            <el-button 
              type="primary" 
              :disabled="isConnected" 
              @click="handleConnect"
            >
              连接
            </el-button>
            
            <el-button 
              type="success" 
              :disabled="!isConnected || isRecording" 
              @click="handleStartRecording"
            >
              开始
            </el-button>
            
            <el-button 
              type="danger" 
              :disabled="!isRecording" 
              @click="handleStopRecording"
            >
              停止
            </el-button>
            
            <el-button 
              type="info" 
              @click="handlePollResponse"
            >
              获取回复
            </el-button>
          </div>
          
          <!-- 音频播放器 -->
          <audio v-if="audioUrl" controls :src="audioUrl" class="audio-player"></audio>
        </el-card>
      </el-col>
      
      <!-- 右侧：提示内容 -->
      <el-col :span="12">
        <el-card class="info-box">
          <template #header>
            <h2>提示内容</h2>
          </template>
          <div v-for="(info, index) in infoMessages" :key="index" class="info-message">
            {{ info }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 知识库上传区域 -->
    <el-card class="upload-container" style="margin-top: 20px;">
      <template #header>
        <h2>知识库管理</h2>
      </template>
      
      <div class="upload-content">
        <el-upload
          class="upload-demo"
          action="http://59.77.5.65:8808/api/upload-knowledge"
          :on-change="handleFileChange"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :show-file-list="false"
          :auto-upload="false"
          accept=".json"
        >
          <template #trigger>
            <el-button type="primary">选择文件</el-button>
          </template>
          
          <el-button 
            class="ml-3" 
            type="success" 
            @click="submitUpload"
            :disabled="!selectedFile"
          >
            上传
          </el-button>
        </el-upload>
        
        <div class="file-info" v-if="selectedFile">
          已选择文件: {{ selectedFile.name }}
        </div>
        
        <el-progress 
          v-if="uploading"
          :percentage="uploadProgress"
          :status="uploadStatus"
        />
        
        <div class="upload-result" v-if="uploadResult">
          {{ uploadResult }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';

// 消息数据
const messages = ref([
  { role: "bot", text: "如何申请英语课免修" },
  { role: "user", text: "好的，请稍等，我查询一下" }
]);

// 信息框内容
const infoMessages = ref([
  "相关问题：\n\n问题 1：硕士研究生申请公共外语课程免修的程序是什么？\n回答：符合免修条件的硕士生应在入学后 2 周内，登录厦门大学教务服务平台，网上提交免修申请。"
]);

// 文本输入
const inputText = ref('');

// 语音控制状态
const isConnected = ref(false);
const isRecording = ref(false);
const voiceStatus = computed(() => {
  if (!isConnected.value) return '请点击连接';
  if (isRecording.value) return '正在录制系统声音...';
  return '请点击开始录制';
});

// 音频相关
const audioUrl = ref('');
const audioBlob = ref(null);
const recText = ref('');
const offlineText = ref('');

// 系统声音录制器实例
const systemRecorder = ref(null);

// WebSocket 相关
const socket = ref(null);
const wsUrl = 'wss://www.funasr.com:10096/'; // WebSocket服务地址

// 文件上传相关
const selectedFile = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref('');
const uploadResult = ref('');

// 初始化系统声音录制器
const initSystemRecorder = () => {
  try {
      // 配置同时录制麦克风和系统声音
      const config = {
          speaker: true,  // 录制系统声音
          mic: false      // 不录制麦克风声音
      };
      
      systemRecorder.value = new MicSpeakerRecorder(
          config,
          () => {
              // 录制开始回调
              isRecording.value = true;
              console.log("系统声音录制开始");
          },
          (blobData) => {
              // 录制停止回调
              audioBlob.value = blobData;
              audioUrl.value = URL.createObjectURL(blobData);
              isRecording.value = false;
              console.log("系统声音录制停止");
              
              // 将录制的音频发送到服务器处理
              sendAudioToServer(blobData);
          },
          (error) => {
              // 错误回调
              isRecording.value = false;
              console.error("系统声音录制错误:", error);
              ElMessage.error('录制系统声音时出错');
          }
      );
      systemRecorder.value.ondataavailable = (audioChunk) => {
          console.log("音频数据块:", audioChunk);
          sendAudioChunkToServer(audioChunk);
      };
  } catch (error) {
      console.error("初始化系统声音录制器失败:", error);
      ElMessage.error('初始化系统声音录制器失败');
  }
};

// 发送音频数据块到服务器
const sendAudioChunkToServer = (chunk) => {
  if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket 未连接');
    return;
  }

  // 将 Blob 转换为 ArrayBuffer
  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result;
    socket.value.send(arrayBuffer);
  };
  reader.readAsArrayBuffer(chunk);
};

// 发送音频数据到服务器
const sendAudioToServer = (blob) => {
  if (!socket.value || !isConnected.value) {
      ElMessage.warning('请先连接WebSocket');
      return;
  }
  
  // 将Blob转换为ArrayBuffer
  const reader = new FileReader();
  reader.onload = () => {
      const arrayBuffer = reader.result;
      const audioData = new Int16Array(arrayBuffer);
      
      // 发送音频数据
      if (socket.value.readyState === WebSocket.OPEN) {
          socket.value.send(audioData);
          ElMessage.success('音频数据已发送');
      }
  };
  reader.readAsArrayBuffer(blob);
};

// 连接WebSocket
const connectWebSocket = () => {
  try {
      socket.value = new WebSocket(wsUrl);
      
      socket.value.onopen = () => {
          isConnected.value = true;
          ElMessage.success('WebSocket连接成功');
          console.log('WebSocket连接已建立');
      };
      
      socket.value.onmessage = (event) => {
          handleWebSocketMessage(event.data);
      };
      
      socket.value.onclose = () => {
          isConnected.value = false;
          console.log('WebSocket连接已关闭');
      };
      
      socket.value.onerror = (error) => {
          isConnected.value = false;
          ElMessage.error('WebSocket连接错误');
          console.error('WebSocket错误:', error);
      };
  } catch (error) {
      console.error('WebSocket连接失败:', error);
      ElMessage.error('WebSocket连接失败');
  }
};

// 断开WebSocket
const disconnectWebSocket = () => {
  if (socket.value) {
      socket.value.close();
      isConnected.value = false;
  }
};

// 处理WebSocket消息
const handleWebSocketMessage = (message) => {
  try {
      const jsonMsg = JSON.parse(message);
      console.log('收到消息:', jsonMsg);
      
      let rectxt = jsonMsg.text || '';
      
      // 处理第一个字符是标点符号的情况
      if (rectxt.length > 0) {
          const punctuationRegex = /^[，。！？、：；""''（）【】《》…—,.!?:;"'()[\]{}<>]/;
          if (punctuationRegex.test(rectxt.charAt(0))) {
              rectxt = rectxt.substring(1);
          }
      }
      
      const asrmodel = jsonMsg.mode;
      const is_final = jsonMsg.is_final;
      const timestamp = jsonMsg.timestamp;
      
      if (asrmodel === "2pass-offline" || asrmodel === "offline") {
          offlineText.value = offlineText.value + rectxt.replace(/ +/g, "") + '\n';
          recText.value = offlineText.value;
          
          if (is_final) {
              addChatMessage(recText.value);
              recText.value = "";
              offlineText.value = "";
          }
      } else {
          recText.value = recText.value + rectxt;
      }
      
      if (recText.value && recText.value.trim() !== '') {
          addChatMessage(recText.value);
      }
  } catch (error) {
      console.error('处理WebSocket消息出错:', error);
  }
};

// 开始录制系统声音
const startRecording = () => {
  if (!systemRecorder.value) {
      initSystemRecorder();
  }
  
  if (systemRecorder.value) {
      systemRecorder.value.start();
  }
};

// 停止录制系统声音
const stopRecording = () => {
  if (systemRecorder.value && isRecording.value) {
      systemRecorder.value.stop();
  }
};

// 添加聊天消息
const addChatMessage = (text) => {
  if (text.trim()) {
      messages.value.push({ role: "user", text });
      // 模拟机器人回复
      setTimeout(() => {
          messages.value.push({ role: "bot", text: "我已收到您的消息，正在处理中..." });
          getRAGResult(text);
      }, 1000);
  }
};

// 文本发送处理
const sendText = () => {
  if (inputText.value.trim()) {
      addChatMessage(inputText.value);
      inputText.value = '';
  }
};

// 语音控制处理
const handleConnect = () => {
  connectWebSocket();
};

const handleStartRecording = () => {
  if (!isConnected.value) {
      ElMessage.warning('请先连接WebSocket');
      return;
  }
  startRecording();
};

const handleStopRecording = () => {
  stopRecording();
};

const handlePollResponse = () => {
  if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'user') {
      const lastUserMessage = messages.value[messages.value.length - 1].text;
      getRAGResult(lastUserMessage);
  } else {
      ElMessage.warning('没有可查询的用户消息');
  }
};

// 文件上传处理
const handleFileChange = (file) => {
  selectedFile.value = file;
  uploadResult.value = '';
};

const beforeUpload = (file) => {
  const isJSON = file.type === 'application/json' || file.name.endsWith('.json');
  if (!isJSON) {
      ElMessage.error('只能上传JSON格式文件');
      return false;
  }
  return true;
};

const submitUpload = () => {
  if (!selectedFile.value) return;
  
  uploading.value = true;
  uploadProgress.value = 0;
  uploadStatus.value = '';
  
  // 创建FormData
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  
  // 使用fetch API上传文件
  fetch('http://59.77.5.65:8808/api/upload-knowledge', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      uploadStatus.value = 'success';
      uploadResult.value = `${data.message}，知识库现有${data.total_qa_pairs}个问答对`;
      ElMessage.success('上传成功');
  })
  .catch(error => {
      uploadStatus.value = 'exception';
      uploadResult.value = '上传失败: ' + (error.message || '服务器错误');
      ElMessage.error('上传失败');
  })
  .finally(() => {
      uploading.value = false;
      uploadProgress.value = 100;
  });
  
  // 模拟上传进度
  const interval = setInterval(() => {
      if (uploadProgress.value < 90) {
          uploadProgress.value += 10;
      }
  }, 300);
};

const handleUploadSuccess = (response) => {
  uploading.value = false;
  uploadProgress.value = 100;
  uploadResult.value = `${response.message}，知识库现有${response.total_qa_pairs}个问答对`;
  ElMessage.success('上传成功');
};

const handleUploadError = (error) => {
  uploading.value = false;
  uploadStatus.value = 'exception';
  uploadResult.value = '上传失败: ' + (error.message || '服务器错误');
  ElMessage.error('上传失败');
};

// 获取RAG结果
const getRAGResult = async (query) => {
  try {
      // 在信息框添加加载状态
      const loadingIndex = infoMessages.value.length;
      infoMessages.value.push("正在为您查询...");
      
      // 实际API请求
      const response = await fetch('http://59.77.5.65:8808/api/query', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              query: query,
              top_k: 3,
              threshold: 0.6
          })
      });
      
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      let formattedResponse = "";
      
      if (data.results && data.results.length > 0) {
          formattedResponse = "相关问题：\n\n";
          data.results.forEach((result, index) => {
              formattedResponse += `问题 ${index + 1}：${result.question}\n`;
              formattedResponse += `回答：${result.answer}\n\n`;
          });
      } else {
          formattedResponse = "知识库中没有找到相关问题。";
      }
      
      // 更新信息框
      infoMessages.value[loadingIndex] = formattedResponse;
  } catch (error) {
      console.error("查询失败:", error);
      ElMessage.error('获取回复时出错');
  }
};

// 组件挂载时初始化
onMounted(() => {
  initSystemRecorder();
});

// 组件卸载前清理
onBeforeUnmount(() => {
  stopRecording();
  disconnectWebSocket();
});
</script>

<style scoped>
.smart-customer-service {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.chat-box {
  height: 500px;
  margin-bottom: 20px;
}

.message-container {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.message {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  max-width: 80%;
}

.user-message {
  background-color: #e1f5fe;
  margin-left: auto;
}

.bot-message {
  background-color: #f5f5f5;
  margin-right: auto;
}

.voice-control {
  margin-bottom: 20px;
}

.status {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.info-box {
  height: 600px;
  overflow-y: auto;
}

.info-message {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  white-space: pre-wrap;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-info {
  margin-top: 10px;
  color: #666;
}

.upload-result {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.audio-player {
  width: 100%;
  margin-top: 15px;
}
</style>