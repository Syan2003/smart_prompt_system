<template>
    <div class="user-settings-view">
      <div class="settings-container">
        <div class="section">
          <h3>账户设置</h3>
          <div class="setting-item">
            <span>旧密码</span>
            <el-input v-model="old_password" placeholder="请输入旧密码" show-password/>
          </div>
          <div class="setting-item">
            <span>新密码</span>
            <el-input v-model="password" placeholder="请输入新密码" show-password/>
          </div>
          <div class="setting-item">
            <span>再输入一遍</span>
            <el-input v-model="second_password" placeholder="请输入新密码" show-password/>
          </div>
          <el-button type="primary" class="save-button" @click="showConfirmDialog = true">确认</el-button>
        </div>
        <div class="section">
          <h3>语言克隆</h3>
          <p>请在安静环境按住录音朗读：今天天气很好，心情不错哦，来聊聊吧！</p>
          <!-- <div class="audio-record-section" style="margin: 12px 0;">
            <div style="display: flex; align-items: center;">
              <el-icon style="margin-right: 8px;"><i class="el-icon-mic"></i></el-icon>
              <span v-if="isRecording">录音中：{{ formatTime(recordingTime) }}</span>
              <span v-else>未在录音</span>
            </div>
          </div> -->
          <div v-if="audioUrl" style="margin-top: 12px;">
            <!-- <span v-if="isRecording">录音中：{{ formatTime(recordingTime) }}</span> -->
            <audio :src="audioUrl" controls style="width: 100%;"></audio>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <div>
              <el-button :type="isRecording ? 'danger' : 'primary'" @click="toggleRecording">
                <div v-if="isRecording === true"><el-icon><Microphone /></el-icon></div>
                <div v-else><el-icon><Mute /></el-icon></div>
                {{ isRecording ? '停止录音' : '开始录音' }}
              </el-button>
              <span v-if="isRecording" style="margin-left: 5px;">录音中：{{ formatTime(recordingTime) }}</span>
            </div>
            <!-- <el-button type="success" :disabled="!audioUrl" @click="useAudio">使用该录音</el-button> -->
            <el-button type="success" :disabled="!audioUrl" @click="showUploadConfirmDialog = true">使用该录音</el-button>
            <el-upload
              class="upload-demo"
              :before-upload="handleUpload"
              :show-file-list="false"
              accept=".mp3,.wav"
            >
              <el-button type="primary"><el-icon class="el-icon--upload"><upload-filled /></el-icon>上传语音文件</el-button>
            </el-upload>
          </div>
        </div>
      </div>
        <div class="system-test-view">
            <div class="test-container">
            <!-- 系统测试部分 -->
            <div class="test-section">
                <span class="section-title">系统测试</span>
                <el-button type="primary" class="test-button"><el-icon><Microphone /></el-icon>开始测试</el-button>
                <div class="test-log">
                  <span class="log-title">测试日志：</span>
                  <span class="log-item">网络正常</span>
                  <span class="log-item">云端服务正常</span>
                  <span class="log-item">用户端正常</span>
                </div>
            </div>

            <!-- FAQ部分 -->
            <div class="faq-section">
                    <h3 class="section-title">如何提高AI生成内容的质量？</h3>
                    <el-collapse>
                    <el-collapse-item>
                        <template #title>
                        <span class="expand-text">点击展开查看详细内容</span>
                        </template>
                        <div class="expand-content">展开详情</div>
                    </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
        </div>
    </div>
    <el-dialog title="确认修改密码" v-model="showConfirmDialog" width="30%">
      <span>您确定要修改密码吗？</span>
      <template #footer>
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmPasswordChange">确认</el-button>
      </template>
    </el-dialog>
    <el-dialog title="确认上传语音" v-model="showUploadConfirmDialog" width="30%">
      <span>您确定要上传该语音用于语言克隆吗？</span>
      <template #footer>
        <el-button @click="showUploadConfirmDialog = false">取消</el-button>
        <el-button type="primary" @click="useAudio">确认上传</el-button>
      </template>
    </el-dialog>
  </template>
  
<script>
import { ref, onUnmounted } from 'vue'
import { StarFilled,Microphone,UploadFilled,Mute } from '@element-plus/icons-vue'
import axios from 'axios';
import { ElMessage } from 'element-plus'

export default {
  components: { StarFilled,Microphone,UploadFilled,Mute },
  setup() {
    const second_password = ref('')
    const password = ref('')
    const old_password = ref('')
    const cardCount = ref(10)
    const activeTab = ref('reference')
    const activeCollapse = ref(['1'])
    const showConfirmDialog = ref(false)
    const audioLevel = ref(10)
    const isRecording = ref(false)
    const recordingTime = ref(0)
    const timer = ref(null)
    const mediaRecorder = ref(null)
    const audioChunks = []
    const audioUrl = ref('0')
    const audioBlob = ref(null)
    const showUploadConfirmDialog = ref(false)

    const formatTime = (seconds) => {
      const min = String(Math.floor(seconds / 60)).padStart(2, '0')
      const sec = String(seconds % 60).padStart(2, '0')
      return `${min}:${sec}`
    }

    const toggleRecording = async () => {
      if (!isRecording.value) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          mediaRecorder.value = new MediaRecorder(stream)
          audioChunks.length = 0

          mediaRecorder.value.ondataavailable = (e) => {
            audioChunks.push(e.data)
          }

          mediaRecorder.value.onstop = () => {
            audioBlob.value = new Blob(audioChunks, { type: 'audio/webm' })
            audioUrl.value = URL.createObjectURL(audioBlob.value)
            console.log('录音完成，音频大小:', audioBlob.value.size)
          }

          mediaRecorder.value.start()
          isRecording.value = true
          recordingTime.value = 0
          timer.value = setInterval(() => recordingTime.value++, 1000)
        } catch (err) {
          console.error('无法访问麦克风：', err)
        }
      } else {
        mediaRecorder.value.stop()
        isRecording.value = false
        clearInterval(timer.value)
      }
    }

    const useAudio = async () => {
      showUploadConfirmDialog.value = false;
      if (!audioBlob.value) {
        // console.warn('没有可上传的音频文件');
        alert('请先录音或上传音频文件');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', audioBlob.value, 'user-recording.mp3');

        const response = await axios.post('/air/copyVocie/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.code === 200) {
          ElMessage({
            message: '上传成功',
            type: 'success',
          })
          console.log('上传成功，后端返回路径：', response.data.msg);
        } else {
          console.error('上传失败：', response.data.msg || '未知错误');
        }
      } catch (err) {
        console.error('上传音频失败：', err);
      }
    };


    const handleUpload = (file) => {
      audioBlob.value = file
      audioUrl.value = URL.createObjectURL(file)

      console.log('上传的音频文件：', file.name, '大小：', file.size)
      return false
    }

    onUnmounted(() => {
      clearInterval(timer.value)
    })

    const confirmPasswordChange = async () => {
      if (password.value !== second_password.value) {
        alert('两次输入的密码不一致')
        return
      }
      try {

        const response = await axios.put('/system/user/profile/updatePwd', {
            oldPassword: old_password.value,
            newPassword: password.value
        })

        if (response.data && response.data.code === 200) {
          showConfirmDialog.value = false
          // 清空输入框
          old_password.value = ''
          password.value = ''
          second_password.value = ''
        } else {
          console.error(response.data.msg || '密码修改失败')
        }
      } catch (error) {
        console.error('请求出错：', error)
      }
    }

    return {
      second_password,
      password,
      old_password,
      cardCount,
      activeTab,
      activeCollapse,
      showConfirmDialog,
      audioLevel,
      confirmPasswordChange,
      isRecording,
      recordingTime,
      toggleRecording,
      formatTime,
      handleUpload,
      audioUrl,
      useAudio,
      audioBlob,
      showUploadConfirmDialog
    }
  }
}
</script>
  
  <style scoped>
  .user-settings-view {
    padding: 20px;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .settings-container {
    display: flex;
    gap: 20px;
  }
  
  .section {
    flex: 1;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
  }
  
  .section h3 {
    font-size: 16px;
    margin-bottom: 20px;
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .setting-item span {
    width: 100px;
    font-size: 14px;
    color: #606266;
  }
  
  .setting-item .el-input,
  .setting-item .el-slider {
    flex: 1;
  }
  
  .save-button {
    margin-top: 20px;
  }
  
  .reference-test {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 20px;
  }
  
  .test-content {
    padding: 10px 0;
  }
  
  .el-collapse {
    border: 2px solid #ffd700;
    border-radius: 4px;
  }
  
  .ai-generated-tag {
    margin-top: 10px;
    text-align: right;
  }
  
  .ai-generated-tag .el-tag {
    background-color: #fff7e6;
    color: #d48806;
  }
  .system-test-view {
  padding: 10px;
  background: #f9f9f9;
  min-height: 100vh;
}

.test-container {
  margin: 0 auto;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.test-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 16px;
  color: #333;
  margin-right: 16px;
}

.test-button {
  margin-right: 16px;
}

.test-log {
  display: inline-block;
  font-size: 14px;
  color: #333;
}

.log-title {
  color: #666;
  margin-right: 8px;
}

.log-item {
  margin-right: 8px;
}

.log-item:after {
  content: "、";
}

.log-item:last-child:after {
  content: "";
}

.faq-section {
  margin-top: 24px;
}

.faq-section .section-title {
  margin: 0 0 12px 0;
  display: block;
}

.expand-text {
  color: #666;
  font-size: 14px;
}

.expand-content {
  padding: 12px;
  color: #666;
  font-size: 14px;
}
  </style>