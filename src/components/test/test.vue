<template>
  <el-row :gutter="20">
      <el-col :span="18">
        <div class="card-list">
          <div
            v-for="item in cards"
            :key="item.id"
            class="confirm-content"
            :class="item.confidence === 'confirmed' ? 'verified' : 'ai-generated'"
          >
            <div class="confirm-title">{{ item.question }}</div>
            
            <div v-if="expandedIds.includes(item.id)" class="confirm-body">
              <p>{{ item.answer }}</p>
            </div>

            <el-link
              type="primary"
              class="expand"
              @click="toggleExpand(item.id)"
            >
              <el-icon><ArrowDown v-if="!expandedIds.includes(item.id)" /><ArrowUp v-else /></el-icon>
              {{ expandedIds.includes(item.id) ? '收起详情' : '展开详情' }}
            </el-link>

            <div class="confirm-status">
              <el-icon style="color: green" v-if="item.confidence === 'confirmed'"><Check /></el-icon>
              <el-icon v-else><MagicStick /></el-icon>
              <span class="verified-text">
                {{ item.confidence === 'confirmed' ? '已验证' : 'AI生成' }}
              </span>
            </div>
          </div>
        </div>

      </el-col>

      <el-col :span="6">
      <div class="side-title">推荐问题</div>
      <el-menu class="recommend-list">
          <el-menu-item index="1">01 如何使用提示词提高AI创作效率？</el-menu-item>
          <el-menu-item index="2">02 提示词工程的基本原则是什么？</el-menu-item>
          <el-menu-item index="3">03 如何评估提示词的效果？</el-menu-item>
          <el-menu-item index="4">04 提示词的版本管理策略</el-menu-item>
          <el-menu-item index="5">05 多语言提示词的优化方法</el-menu-item>
      </el-menu>
      </el-col>
  </el-row>
  <div class="asr-container">
      <div class="asr-text">{{ asrText || '🎤 准备开始识别...' }}</div>
      <el-button 
          type="primary" 
          circle 
          class="mic-button" 
          @click="toggleASR"
      >
          <div v-if="asrActive === true"><el-icon><Microphone /></el-icon></div>
          <div v-else><el-icon><Mute /></el-icon></div>
      </el-button>
  </div>
  <!-- <div class="footer">
      <el-icon><Clock /></el-icon>
      00:45
      <el-icon><Microphone /></el-icon>
      麦克风已开启
  </div> -->
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import {
Search,
MagicStick,
Check,
ChatDotRound,
Star,
Microphone,
Mute,
ArrowDown,
ArrowUp
} from '@element-plus/icons-vue'

// 响应式状态
const asrText = ref('')
const asrFinalText = ref('')
const asrActive = ref(false)
const cards = ref<any[]>([])
const expandedIds = ref<number[]>([])

const chat = ref({
query: '我想了解下厦门大学课程有什么类型',
history: [
  // { role: 'user', content: '你好' },
  // { role: 'assistant', content: '你好！有什么我可以帮助你的吗？' }
]
})

// 音频处理相关变量
let audioContext: AudioContext
let micSource: MediaStreamAudioSourceNode
let sysSource: MediaStreamAudioSourceNode
let processor: ScriptProcessorNode
let micStream: MediaStream
let sysStream: MediaStream
let combinedStream: MediaStream
let websocket: WebSocket
let sampleBuf = new Int16Array()
const CHUNK_SIZE = 960

const downsampleBuffer = (
buffer: Float32Array,
sampleRate: number,
targetSampleRate: number
): Float32Array => {
if (targetSampleRate === sampleRate) return buffer
const ratio = sampleRate / targetSampleRate
const newLength = Math.round(buffer.length / ratio)
const result = new Float32Array(newLength)
let offsetResult = 0,
  offsetBuffer = 0

while (offsetResult < result.length) {
  const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio)
  let accum = 0,
    count = 0
  for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
    accum += buffer[i]
    count++
  }
  result[offsetResult++] = accum / count
  offsetBuffer = nextOffsetBuffer
}

return result
}

const getRAGResult = async (chatParam: any) => {
try {
  const response = await axios.post('/air/promptCard/getPrompts', chatParam)
  console.log('RAG结果:', response.data.data[0])
  const results = response.data.data[0].results || []

  // cards.value = results.map((item: any, index: number) => ({
  //   ...item,
  //   id: index + 1 
  // }))

  results.forEach((item: any, index: number) => {
    cards.value.push({
      ...item,
      id: cards.value.length + 1 + index 
    })
  })
} catch (error) {
  console.error('响应失败:', error)
}
}

const startASR = async () => {
try {
  asrText.value = ''
  asrFinalText.value = ''
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  sysStream = await navigator.mediaDevices.getDisplayMedia({ audio: true })

  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  micSource = audioContext.createMediaStreamSource(micStream)
  sysSource = audioContext.createMediaStreamSource(sysStream)

  const destination = audioContext.createMediaStreamDestination()
  micSource.connect(destination)
  sysSource.connect(destination)
  combinedStream = destination.stream

  websocket = new WebSocket('wss://www.funasr.com:10096/')
  websocket.binaryType = 'arraybuffer'

  websocket.onopen = () => {
    websocket.send(
      JSON.stringify({
        chunk_size: [5, 10, 5],
        wav_name: 'h5',
        is_speaking: true,
        chunk_interval: 10,
        mode: '2pass'
      })
    )
  }

  websocket.onmessage = (event) => {
    try {
      const result = JSON.parse(event.data)
      const text = result.text || result.result
      const model = result.mode

      if (model === '2pass-offline' || model === 'offline') {
        console.log('识别结果:', result)
        asrFinalText.value = asrFinalText.value + '\n' + text
        asrText.value = asrFinalText.value
        chat.value.query = text
        getRAGResult(chat.value)
        toggleExpand(1)
      } else {
        console.log('临时结果:', result)
        asrText.value += text
      }
    } catch (e) {
      console.log('原始数据:', event.data)
    }
  }

  processor = audioContext.createScriptProcessor(4096, 1, 1)
  processor.onaudioprocess = (e) => {
    const inputData = e.inputBuffer.getChannelData(0)
    const downsampled = downsampleBuffer(inputData, 48000, 16000)
    const pcm = new Int16Array(downsampled.length)

    for (let i = 0; i < downsampled.length; i++) {
      const s = Math.max(-1, Math.min(1, downsampled[i]))
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }

    sampleBuf = Int16Array.from([...sampleBuf, ...pcm])
    while (sampleBuf.length >= CHUNK_SIZE) {
      const chunk = sampleBuf.slice(0, CHUNK_SIZE)
      sampleBuf = sampleBuf.slice(CHUNK_SIZE)
      if (websocket.readyState === WebSocket.OPEN) websocket.send(chunk.buffer)
    }
  }

  const combinedSource = audioContext.createMediaStreamSource(combinedStream)
  combinedSource.connect(processor)
  processor.connect(audioContext.destination)
  asrActive.value = true
} catch (err) {
  console.error('识别初始化失败:', err)
  alert('请确认授权系统音频共享和麦克风权限')
  asrActive.value = false
}
}

const stopASR = () => {
if (websocket && websocket.readyState === WebSocket.OPEN) {
  websocket.send(JSON.stringify({ is_speaking: false }))
  websocket.close()
}
processor?.disconnect()
audioContext?.close()
micStream?.getTracks().forEach((t) => t.stop())
sysStream?.getTracks().forEach((t) => t.stop())
sampleBuf = new Int16Array()
asrActive.value = false
}

const toggleASR = () => {
asrActive.value ? stopASR() : startASR()
}

const toggleExpand = (id: number) => {
console.log(id)
const index = expandedIds.value.indexOf(id)
if (index === -1) {
  expandedIds.value.push(id)
} else {
  expandedIds.value.splice(index, 1)
}
}

// 生命周期钩子
onMounted(() => {
// getQa()
// toggleExpand(1)
// getRAGResult(chat.value)
})

onBeforeUnmount(() => {
stopASR()
})
</script>


<style scoped>
.asr-container {
position: fixed;
bottom: 40px;
left: 50%;
transform: translateX(-50%);
text-align: center;
}
.asr-text {
background: rgba(0, 0, 0, 0.7);
color: #fff;
padding: 8px 16px;
border-radius: 10px;
margin-bottom: 10px;
font-size: 14px;
max-width: 90vw;
word-wrap: break-word;
}
.mic-button {
font-size: 20px;
width: 50px;
height: 35px;
}

.app-container {
font-family: 'Helvetica Neue', sans-serif;
}
.header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0 20px;
background: white;
border-bottom: 1px solid #eee;
height: 60px;
}
.logo {
display: flex;
align-items: center;
font-weight: bold;
font-size: 18px;
}
.nav {
display: flex;
gap: 30px;
}
.nav-item {
cursor: pointer;
color: #666;
}
.nav-item.active {
color: #409EFF;
font-weight: bold;
}
.user {
display: flex;
align-items: center;
gap: 10px;
}
.main {
background: #f9f9f9;
padding: 20px;
}
.card {
margin-bottom: 20px;
position: relative;
}
.verified {
border-left: 4px solid #67C23A;
}
.ai-generated {
border-left: 4px solid #E6A23C;
}
.card-title {
font-size: 16px;
font-weight: bold;
margin-bottom: 10px;
}
.card-footer {
display: flex;
gap: 10px;
align-items: center;
margin-top: 10px;
}
.badge {
position: absolute;
top: 10px;
right: 10px;
color: #E6A23C;
display: flex;
align-items: center;
gap: 5px;
}
.expand {
display: inline-block;
margin-top: 10px;
}
.side-title {
font-weight: bold;
margin-bottom: 10px;
}
.recommend-list {
background: white;
border: 1px solid #eee;
}
.footer {
display: flex;
align-items: center;
gap: 10px;
padding-top: 20px;
font-size: 14px;
color: #666;
}
.card-list {
display: flex;
flex-direction: column;
gap: 20px;
}

.card-title {
font-weight: bold;
font-size: 16px;
margin-bottom: 10px;
}

.card-answer {
margin: 10px 0;
color: #606266;
}

.expand {
margin-bottom: 10px;
display: inline-block;
}

.badge {
display: flex;
align-items: center;
gap: 5px;
font-size: 13px;
color: #67c23a;
}

.card.ai-generated .badge {
color: #409eff;
}
.confirm-content {
border: 2px solid #4CAF50;
border-radius: 10px;
padding: 20px;
position: relative;
background-color: #fff;
}

.confirm-title {
font-weight: bold;
font-size: 18px;
margin-bottom: 10px;
}

.confirm-body {
font-size: 14px;
line-height: 1.8;
color: #333;
}

.collapse-link {
display: inline-block;
margin-top: 10px;
font-size: 14px;
}

.confirm-status {
position: absolute;
top: 15px;
right: 20px;
display: flex;
align-items: center;
color: #4CAF50;
font-size: 14px;
}
.verified {
border-color: #4baf4f; /* 绿色边框 */
}

.ai-generated {
border-color: #ffc107; /* 黄色边框 */
}
</style>
