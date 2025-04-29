<template>
    <div class="layout">
      <!-- 左侧会话栏 -->
      <div class="chat-sidebar">
        <!-- 顶部图标区 -->
        <div class="top-icons">
          <el-button link type="primary" @click="CreatChat">
            <el-icon><Plus /></el-icon><div style="margin-left: 5px;">新聊天</div>
          </el-button>
        </div>
        <!-- 会话列表 -->
        <div class="chat-session-list">
          <div v-for="(group, gIndex) in groupedSessions" :key="gIndex" class="session-group">
            <div class="group-title">{{ group.label }}</div>
            <!-- <div
              v-for="session in group.items"
              :key="session.id"
              :class="['session-item', { active: session.id === currentSessionId }]"
              @click="selectSession(session.id)"
            >
              {{ session.title }}
            </div> -->
            <div
                v-for="session in group.items"
                :key="session.id"
                :class="['session-item', { active: session.id === currentSessionId }]"
                @click="selectSession(session.id)"
              >
                <span class="session-title">{{ session.title }}</span>

                <!-- 操作按钮区域 -->
                <el-dropdown
                  trigger="click"
                  @command="handleSessionCommand(session.id, $event)"
                  @click.stop
                >
                  <span class="dropdown-trigger" @click.stop>
                    <el-icon><MoreFilled /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu @click.stop>
                      <el-dropdown-item command="rename">重命名</el-dropdown-item>
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

          </div>
        </div>
      </div>
      <div class="main-content">
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
                  <el-menu-item 
                    v-for="(item, index) in recommend_cards" 
                    :key="item.id" 
                    :index="item.id"
                    @click="goToCard(index)"
                  >
                    {{ item.id }} {{ item.question }}
                  </el-menu-item>
                </el-menu>
            </el-col>
        </el-row>
        <div class="asr-container">
            <div class="asr-text">{{ micAsrText  || '🎤 请打开或等待麦克风语音...' }}</div>
            <div class="asr-text">{{ sysAsrText  || '🎤 请打开或等待系统音频语音...' }}</div>

            <el-button 
                type="primary" 
                round 
                @click="toggleMicASR"
            >
                <div v-if="micActive === true"><el-icon><Microphone /></el-icon></div>
                <div v-else><el-icon><Mute /></el-icon></div>
                麦克风声音
            </el-button>
            <el-button 
                type="success" 
                round 
                @click="toggleSysASR"
            >
                <div v-if="sysActive === true"><el-icon><Microphone /></el-icon></div>
                <div v-else><el-icon><Mute /></el-icon></div>
                系统声音
            </el-button>
        </div>
        <!-- 聊天悬浮框 -->
        <div class="chat-float-window" v-show="chatVisible">
          <div class="container">
            <div class="main">
              <div class="box">
                <div class="title" style="text-align: center; margin-bottom: 0px;">
                  <!-- <img src="../../../public/messages.png" alt class="logo" style="height: 5%; width: 50px;"/> -->
                  <span>对话窗口</span>
                </div>
                <div id="content" class="content" ref="contentRef">
                  <div v-for="(item, index) in info" :key="index">
                    <div class="info_r info_default" v-if="item.type == 'leftinfo'">
                      <img src="../../../public/people.png" alt="" class="circle circle_r" />
                      <div class="con_r con_text" style="min-height: 5px;">
                        <div>{{ item.content }}</div>
                      </div>
                      <div class="time_r">{{ item.time }}</div>
                    </div>

                    <div class="info_l" v-else>
                      <div class="con_r con_text">
                        <span class="con_l" style="min-height: 5px;">{{ item.content }}</span>
                        <span class="circle circle_l">
                          <img src="../../../public/chat.png" alt="" class="circle circle_r" />
                        </span>
                      </div>
                      <div class="time_l">{{ item.time }}</div>
                    </div>
                  </div>
                    <!-- 实时识别展示 -->
                  <!-- <div class="info_l" v-if="micActive && micAsrText">
                    <div class="con_r con_text">
                      <span class="con_l">{{ micAsrText }}</span>
                      <span class="circle circle_l">
                        <img src="../../../public/chat.png" alt="" class="circle circle_r" />
                      </span>
                    </div>
                    <div class="time_l">{{ getCurrentTime() }}</div>
                  </div>
                  <div class="info_r info_default" v-if="sysActive && sysAsrText">
                    <img src="../../../public/people.png" alt="" class="circle circle_r" />
                    <div class="con_r con_text">
                      <div>{{sysAsrText}}</div>
                    </div>
                    <div class="time_r">{{ getCurrentTime() }}</div>
                  </div> -->
                </div>

                <!-- <div class="setproblem">
                  <textarea
                    placeholder="Please enter your question..."
                    style="height: 68px; width: 100%; resize: none; padding-right: 80px; outline: none; border-color: #ccc; border-radius: 5px;"
                    id="text"
                    v-model="customerText"
                    @keyup.enter="sentMsg"
                  ></textarea>
                  <button @click="sentMsg" class="setproblems">
                    <span style="vertical-align: 4px;">Send</span>
                  </button>
                </div> -->
              </div>
            </div>
          </div>
        </div>
        <!-- 浮动按钮，控制展开收起 -->
        <el-button 
          class="chat-toggle-button" 
          type="primary" 
          circle 
          @click="chatVisible = !chatVisible"
        >
          <el-icon v-if="chatVisible"><ArrowDown /></el-icon>
          <el-icon v-else><ChatDotRound /></el-icon>
        </el-button>
      </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
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
  ArrowUp, Menu, Document, Setting, Plus, MoreFilled
} from '@element-plus/icons-vue'
import { text } from '@fortawesome/fontawesome-svg-core'

// 响应式状态
const asrText = ref('')
const asrFinalText = ref('')
const asrActive = ref(false)
const cards = ref<any[]>([])
const recommend_cards = ref<any[]>([])
const expandedIds = ref<number[]>([])

const micAsrText = ref('')
const micAsrFinalText = ref('')
const micActive = ref(false)

const sysAsrText = ref('')
const sysAsrFinalText = ref('')
const sysActive = ref(false)

const chat_old = ref({
  query: '我想了解下厦门大学课程有什么类型',
  history: [
    // { role: 'user', content: '你好' },
    // { role: 'assistant', content: '你好！有什么我可以帮助你的吗？' }
  ]
})

const chat = ref({
  "chatHistory": [
    {
      "role": "user",
      "content": "你好",
      "replyIds": []
    }
  ]
})

//useRouter()：控制跳转、导航（例如 router.push()）
// useRoute()：获取当前路由信息（如 params, query, path 等）
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const id = route.params.id
const chatList = ref([]) // 聊天列表

// 音频处理相关变量
let micStream: MediaStream
let sysStream: MediaStream
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

const getRAGResult_old = async (chatParam: any) => {
  try {
    const response = await axios.post('/air/promptCard/getPrompts', chatParam)
    // console.log('RAG结果:', response.data.data[0])
    const results = response.data.data[0].results || []
    const maxId = Math.max(...cards.value.map(item => item.id), 0); // 获取当前cards数组中的最大ID
    const newItems = results.map((item: any, index: number) => ({
      ...item,
      id: maxId + index + 1 // 生成新的id
    }));
    cards.value.unshift(...newItems);
    if (newItems.length > 0) {
      toggleExpand(newItems[0].id);
    }
    recommend_cards.value = results.map((item: any, index: number) => ({
      ...item,
      id: index + 1 
    }))
  } catch (error) {
    console.error('响应失败:', error)
  }
}

const getRAGResult = async (chatParam: any) => {
  try {
    const response = await axios.post('/air/promptCard/getPromptCards', chatParam)
    // console.log('RAG结果:', response.data.data[0])
    const results = response.data.data.results || []
    const maxId = Math.max(...cards.value.map(item => item.id), 0); // 获取当前cards数组中的最大ID
    const newItems = results.map((item: any, index: number) => ({
      ...item,
      id: maxId + index + 1 // 生成新的id
    }));
    cards.value.unshift(...newItems);
    if (newItems.length > 0) {
      toggleExpand(newItems[0].id);
    }
    recommend_cards.value = results.map((item: any, index: number) => ({
      ...item,
      id: index + 1 
    }))

    // 更新 chat.chatHistory 最后一项的 replyIds
    const replyIds = response.data.data.replyIds || []
    const lastIndex = chat.value.chatHistory.length - 1
    if (lastIndex >= 0) {
      chat.value.chatHistory[lastIndex].replyIds = replyIds
    }
    console.log('chat.id:', id)
    if(!id){
      console.log('chat.id:', id)
      router.push(`/card/${response.data.data.chatId}`)
    }
    console.log('chat.chatHistory:', chat.value.chatHistory)
  } catch (error) {
    console.error('响应失败:', error)
  }
}

let micWebSocket: WebSocket
let micProcessor: ScriptProcessorNode
let micAudioContext: AudioContext
let micSampleBuf = new Int16Array()

import CryptoJS from 'crypto-js'
import md5 from 'crypto-js/md5'

const APPID = '7bbacce7'
const API_KEY = 'e7558fed3b8b89fb8d3f8c71951bbe88'

function getWebSocketUrl() {
  const url = 'wss://rtasr.xfyun.cn/v1/ws'
  const ts = Math.floor(Date.now() / 1000)
  const signa = md5(APPID + ts).toString()
  const signatureSha = CryptoJS.HmacSHA1(signa, API_KEY)
  const signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(signatureSha))
  return `${url}?appid=${APPID}&ts=${ts}&signa=${signature}`
}

const startMicASR = async () => {
  try {
    micAsrText.value = ''
    micAsrFinalText.value = ''

    micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    micAudioContext = new (window.AudioContext || window.webkitAudioContext)()
    const micSource = micAudioContext.createMediaStreamSource(micStream)

    const url = getWebSocketUrl()
    micWebSocket = new WebSocket(url)
    
    micWebSocket.binaryType = 'arraybuffer'

    micWebSocket.onopen = () => {
      micWebSocket.send(JSON.stringify({
        chunk_size: [5, 10, 5],
        wav_name: 'mic',
        is_speaking: true,
        chunk_interval: 10,
        mode: '2pass'
      }))
    }

    micWebSocket.onmessage = (resultData) => {
      // console.log('mic 原始数据:', resultData)
      let jsonData = JSON.parse(resultData.data);
      if (jsonData.action == "started") {
        // 握手成功
        console.log("握手成功");
      } else if (jsonData.action == "result") {
        const data = JSON.parse(jsonData.data)
        // console.log(data)
        // 转写结果
        let resultTextTemp = ""
        data.cn.st.rt.forEach((j) => {
          j.ws.forEach((k) => {
            k.cw.forEach((l) => {
              resultTextTemp += l.w;
            });
          });
        });
        micAsrText.value = resultTextTemp
        console.log("micAsrText.value识别结果:", micAsrText.value);
        let resultText = ""
        if (data.cn.st.type == 0) {
          // 【最终】识别结果：
          resultText += resultTextTemp;
          resultTextTemp = ""
          resultText = removeLeadingPunctuation(resultText)
          console.log("最终识别结果:", resultText);
          micAsrFinalText.value +=  resultText + '\n'
          micAsrText.value = ''
          // chat.value.history.push({ role: 'assistant', content: resultText })
          chat.value.chatHistory.push({ role: 'assistant', content: resultText })
          info.value.push({
            type: "rightinfo",
            content: resultText,
            time: getCurrentTime()
          })
        }
      } else if (jsonData.action == "error") {
        // 连接发生错误
        console.log("出错了:", jsonData);
        alert('无法启动麦克风识别，请检查麦克风权限')
        micActive.value = false
      }
    }

    micProcessor = micAudioContext.createScriptProcessor(4096, 1, 1)
    micProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0)
      const downsampled = downsampleBuffer(inputData, 48000, 16000)
      const pcm = new Int16Array(downsampled.length)

      for (let i = 0; i < downsampled.length; i++) {
        const s = Math.max(-1, Math.min(1, downsampled[i]))
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }

      micSampleBuf = Int16Array.from([...micSampleBuf, ...pcm])
      while (micSampleBuf.length >= CHUNK_SIZE) {
        const chunk = micSampleBuf.slice(0, CHUNK_SIZE)
        micSampleBuf = micSampleBuf.slice(CHUNK_SIZE)
        if (micWebSocket.readyState === WebSocket.OPEN) {
          micWebSocket.send(chunk.buffer)
        }
      }
    }

    micSource.connect(micProcessor)
    micProcessor.connect(micAudioContext.destination)
    micActive.value = true
  } catch (err) {
    console.log( err)
    alert('无法启动麦克风识别，请检查麦克风权限')
    micActive.value = false
  }
}

// const startMicASR = async () => {
//   try {
//     micAsrText.value = ''
//     micAsrFinalText.value = ''

//     micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
//     micAudioContext = new (window.AudioContext || window.webkitAudioContext)()
//     const micSource = micAudioContext.createMediaStreamSource(micStream)

//     const url = getWebSocketUrl()
//     micWebSocket = new WebSocket(url)

//     // micWebSocket = new WebSocket('wss://www.funasr.com:10096/')

//     micWebSocket.binaryType = 'arraybuffer'

//     micWebSocket.onopen = () => {
//       micWebSocket.send(JSON.stringify({
//         chunk_size: [5, 10, 5],
//         wav_name: 'mic',
//         is_speaking: true,
//         chunk_interval: 10,
//         mode: '2pass'
//       }))
//     }

//     micWebSocket.onmessage = (event) => {
//       try {
//         const result = JSON.parse(event.data)
//         let text = result.text || result.result
//         const model = result.mode

//         if (model === '2pass-offline' || model === 'offline') {
//           text = removeLeadingPunctuation(text)
//           micAsrFinalText.value +=  text + '\n'
//           // micAsrText.value = micAsrFinalText.value
//           micAsrText.value = ''
//           chat.value.history.push({ role: 'assistant', content: text })
//           info.value.push({
//             type: "rightinfo",
//             content: text,
//             time: getCurrentTime()
//           })
//         } else {
//           micAsrText.value += text
//         }
//       } catch (e) {
//         console.log('mic 原始数据:', event.data)
//       }
//     }

//     micProcessor = micAudioContext.createScriptProcessor(4096, 1, 1)
//     micProcessor.onaudioprocess = (e) => {
//       const inputData = e.inputBuffer.getChannelData(0)
//       const downsampled = downsampleBuffer(inputData, 48000, 16000)
//       const pcm = new Int16Array(downsampled.length)

//       for (let i = 0; i < downsampled.length; i++) {
//         const s = Math.max(-1, Math.min(1, downsampled[i]))
//         pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
//       }

//       micSampleBuf = Int16Array.from([...micSampleBuf, ...pcm])
//       while (micSampleBuf.length >= CHUNK_SIZE) {
//         const chunk = micSampleBuf.slice(0, CHUNK_SIZE)
//         micSampleBuf = micSampleBuf.slice(CHUNK_SIZE)
//         if (micWebSocket.readyState === WebSocket.OPEN) {
//           micWebSocket.send(chunk.buffer)
//         }
//       }
//     }

//     micSource.connect(micProcessor)
//     micProcessor.connect(micAudioContext.destination)
//     micActive.value = true
//   } catch (err) {
//     console.log( err)
//     alert('无法启动麦克风识别，请检查麦克风权限')
//     micActive.value = false
//   }
// }

const stopMicASR = () => {
  if (micWebSocket?.readyState === WebSocket.OPEN) {
    micWebSocket.send(JSON.stringify({ is_speaking: false }))
    micWebSocket.close()
  }
  micProcessor?.disconnect()
  micAudioContext?.close()
  micStream?.getTracks().forEach(t => t.stop())
  micSampleBuf = new Int16Array()
  micActive.value = false
}

let sysWebSocket: WebSocket
let sysProcessor: ScriptProcessorNode
let sysAudioContext: AudioContext
let sysSampleBuf = new Int16Array()

const startSysASR = async () => {
  try {
    sysAsrText.value = ''
    sysAsrFinalText.value = ''
    // alert('请选择【浏览器标签页】，并勾选“共享标签页音频”')

    sysStream = await navigator.mediaDevices.getDisplayMedia({ audio: true })
    sysAudioContext = new (window.AudioContext || window.webkitAudioContext)()
    const sysSource = sysAudioContext.createMediaStreamSource(sysStream)

    // sysWebSocket = new WebSocket('wss://www.funasr.com:10096/')

    const url = getWebSocketUrl()
    sysWebSocket = new WebSocket(url)
    sysWebSocket.binaryType = 'arraybuffer'

    sysWebSocket.onopen = () => {
      sysWebSocket.send(JSON.stringify({
        chunk_size: [5, 10, 5],
        wav_name: 'sys',
        is_speaking: true,
        chunk_interval: 10,
        mode: '2pass'
      }))
    }

    sysWebSocket.onmessage = (event) => {
      let jsonData = JSON.parse(event.data);
      if (jsonData.action == "started") {
        // 握手成功
        console.log("握手成功");
      } else if (jsonData.action == "result") {
        const data = JSON.parse(jsonData.data)
        // console.log(data)
        // 转写结果
        let resultTextTemp = ""
        data.cn.st.rt.forEach((j) => {
          j.ws.forEach((k) => {
            k.cw.forEach((l) => {
              resultTextTemp += l.w;
            });
          });
        });
        sysAsrText.value = resultTextTemp
        console.log("sysAsrText.value识别结果:", sysAsrText.value);
        let resultText = ""
        if (data.cn.st.type == 0) {
          // 【最终】识别结果：
          resultText += resultTextTemp;
          resultTextTemp = ""
          console.log("最终识别结果:", resultText);
          resultText = removeLeadingPunctuation(resultText)
          sysAsrFinalText.value +=  resultText + '\n'
          sysAsrText.value = ''
          // chat.value.query = resultText
          chat.value.chatHistory.push({ role: 'user', content: resultText })
          getRAGResult(chat.value)
          // chat.value.history.push({ role: 'user', content: resultText })
          info.value.push({
            type: "leftinfo",
            content: resultText,
            time: getCurrentTime()
          })
        }
      } else if (jsonData.action == "error") {
        // 连接发生错误
        console.log("出错了:", jsonData);
        alert('无法启动麦克风识别，请检查麦克风权限')
        sysActive.value = false
      }
    }

    sysProcessor = sysAudioContext.createScriptProcessor(4096, 1, 1)
    sysProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0)
      const downsampled = downsampleBuffer(inputData, 48000, 16000)
      const pcm = new Int16Array(downsampled.length)

      for (let i = 0; i < downsampled.length; i++) {
        const s = Math.max(-1, Math.min(1, downsampled[i]))
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }

      sysSampleBuf = Int16Array.from([...sysSampleBuf, ...pcm])
      while (sysSampleBuf.length >= CHUNK_SIZE) {
        const chunk = sysSampleBuf.slice(0, CHUNK_SIZE)
        sysSampleBuf = sysSampleBuf.slice(CHUNK_SIZE)
        if (sysWebSocket.readyState === WebSocket.OPEN) {
          sysWebSocket.send(chunk.buffer)
        }
      }
    }

    sysSource.connect(sysProcessor)
    sysProcessor.connect(sysAudioContext.destination)
    sysActive.value = true
  } catch (err) {
    // alert('⚠️ 当前浏览器或系统可能不支持系统音频，请选择标签页并勾选共享音频')
    sysActive.value = false
  }
}

// const startSysASR = async () => {
//   try {
//     sysAsrText.value = ''
//     sysAsrFinalText.value = ''
//     // alert('请选择【浏览器标签页】，并勾选“共享标签页音频”')

//     sysStream = await navigator.mediaDevices.getDisplayMedia({ audio: true })
//     sysAudioContext = new (window.AudioContext || window.webkitAudioContext)()
//     const sysSource = sysAudioContext.createMediaStreamSource(sysStream)

//     sysWebSocket = new WebSocket('wss://www.funasr.com:10096/')
//     sysWebSocket.binaryType = 'arraybuffer'

//     sysWebSocket.onopen = () => {
//       sysWebSocket.send(JSON.stringify({
//         chunk_size: [5, 10, 5],
//         wav_name: 'sys',
//         is_speaking: true,
//         chunk_interval: 10,
//         mode: '2pass'
//       }))
//     }

//     sysWebSocket.onmessage = (event) => {
//       try {
//         const result = JSON.parse(event.data)
//         let text = result.text || result.result
//         const model = result.mode

//         if (model === '2pass-offline' || model === 'offline') {
//           text = removeLeadingPunctuation(text)
//           sysAsrFinalText.value += text + '\n'
//           // sysAsrText.value = sysAsrFinalText.value
//           sysAsrText.value = ''

//           chat.value.query = text
//           getRAGResult(chat.value)
//           // toggleExpand(1)
//           chat.value.history.push({
//             role: 'user',
//             content: text
//           })
//           info.value.push({
//             type: "leftinfo",
//             content: text,
//             time: getCurrentTime()
//           })
//         } else {
//           sysAsrText.value += text
//         }
//       } catch (e) {
//         console.log('sys 原始数据:', event.data)
//       }
//     }

//     sysProcessor = sysAudioContext.createScriptProcessor(4096, 1, 1)
//     sysProcessor.onaudioprocess = (e) => {
//       const inputData = e.inputBuffer.getChannelData(0)
//       const downsampled = downsampleBuffer(inputData, 48000, 16000)
//       const pcm = new Int16Array(downsampled.length)

//       for (let i = 0; i < downsampled.length; i++) {
//         const s = Math.max(-1, Math.min(1, downsampled[i]))
//         pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
//       }

//       sysSampleBuf = Int16Array.from([...sysSampleBuf, ...pcm])
//       while (sysSampleBuf.length >= CHUNK_SIZE) {
//         const chunk = sysSampleBuf.slice(0, CHUNK_SIZE)
//         sysSampleBuf = sysSampleBuf.slice(CHUNK_SIZE)
//         if (sysWebSocket.readyState === WebSocket.OPEN) {
//           sysWebSocket.send(chunk.buffer)
//         }
//       }
//     }

//     sysSource.connect(sysProcessor)
//     sysProcessor.connect(sysAudioContext.destination)
//     sysActive.value = true
//   } catch (err) {
//     // alert('⚠️ 当前浏览器或系统可能不支持系统音频，请选择标签页并勾选共享音频')
//     sysActive.value = false
//   }
// }

const stopSysASR = () => {
  if (sysWebSocket?.readyState === WebSocket.OPEN) {
    sysWebSocket.send(JSON.stringify({ is_speaking: false }))
    sysWebSocket.close()
  }
  sysProcessor?.disconnect()
  sysAudioContext?.close()
  sysStream?.getTracks().forEach(t => t.stop())
  sysSampleBuf = new Int16Array()
  sysActive.value = false
}

const toggleMicASR = () => {
  micActive.value ? stopMicASR() : startMicASR()
}
const toggleSysASR = () => {
  sysActive.value ? stopSysASR() : startSysASR()
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

const goToCard = (index: number) => {
  cards.value.unshift({
    id: cards.value.length + 1,
    question: recommend_cards.value[index].question,
    answer: recommend_cards.value[index].answer,
    confidence: recommend_cards.value[index].confidence
  })
  toggleExpand(cards.value[0].id)
  // const cardElement = document.getElementById('card-' + (index + 1)) // index + 1 确保与 cards 的 id 匹配
  // if (cardElement) {
  //   cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // }
}

function removeLeadingPunctuation(text: string): string {
  const punctuationRegex = /^[，。！？、：；""''（）【】《》…—,.!?:;"'()[\]{}<>]/;
  if (punctuationRegex.test(text.charAt(0))) {
    return text.substring(1);
  }
  return text;
}

// 生命周期钩子
onMounted(() => {
  // getQa()
  // toggleExpand(1)
  // getRAGResult(chat.value)
  getChatList()
  if (!id) {
    console.log('这是默认的 /card 页面')
    // router.push('/card/2')
  } else {
    console.log('进入对话卡片 ID:', id)
    currentSessionId.value = Number(id)
    getChatIDList(id)
  }
})

onBeforeUnmount(() => {
  stopMicASR()
  stopSysASR()
// stopASR()
})

// 聊天窗口显示状态
const chatVisible = ref(true)

// 聊天内容
const info = ref([
  // {
  //     type: 'rightinfo',
  //     content: '你好，请问我有什么可以帮助您的？',
  //     time: getCurrentTime()
  // },
  // {
  //     type: "rightinfo",
  //     time: getCurrentTime(),
  //     name: "robot",
  //     content: "Can you tell us about the plan for upgrading Malaysia's electronics industry?"
  // }
])

const contentRef = ref<HTMLElement | null>(null)

// 正确的监听写法
watch(info, () => {
  scrollToBottom()
}, { deep: true })

// 滚动函数
const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (contentRef.value) {
        contentRef.value.scrollTop = contentRef.value.scrollHeight
      }
    }, 50)
  })
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 输入框内容
const customerText = ref('')

// 发送消息
const sentMsg = () => {
  if (!customerText.value.trim()) return

  info.value.push({
    type: 'rightinfo',
    content: customerText.value,
    time: new Date().toLocaleTimeString(),
  })

  // 模拟机器人回复
  setTimeout(() => {
    info.value.push({
      type: 'leftinfo',
      content: 'This is an automated reply to: ' + customerText.value,
      time: new Date().toLocaleTimeString(),
      question: [],
    })
  }, 1000)

  customerText.value = ''
}

const currentSessionId = ref(0)

// 模拟分组结构
const groupedSessions = ref([
  {
    label: '今天',
    items: [
      { id: 1, title: '左侧会话栏设计' },
      { id: 2, title: '修改Vue端口设置' }
    ]
  },
  {
    label: '昨天',
    items: [
      { id: 3, title: 'HTTPS WSS 配置问题' }
    ]
  },
  {
    label: '前 7 天',
    items: [
      { id: 4, title: 'WebSocket headers问题' },
      { id: 5, title: '自适应聊天窗口布局' },
      { id: 6, title: '登录页面响应式调整' },
      { id: 7, title: '聊天信息遮挡问题' },
      { id: 8, title: '查看是否安装nginx' },
      { id: 9, title: '悬浮聊天框实现' },
      { id: 10, title: '音频录制控制' },
      { id: 11, title: '语言录制与WebSocket' },
      { id: 12, title: '麦克风系统音频控制' },
    ]
  }
])

const selectSession = (id) => {
  currentSessionId.value = id
  console.log('选中会话 ID:', id)
  router.push(`/card/${id}`)
  getChatIDList(id)
}

// 计算时间差（天数）
const getDateDiffInDays = (date) => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffTime = now - targetDate
  const diffDays = diffTime / (1000 * 3600 * 24)
  return Math.floor(diffDays)
}

// 根据 update_time 分组的函数
const groupChatSessions = (chatList) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  // 按时间区间分组
  const grouped = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: []
  }

  chatList.forEach((chat) => {
    const updateDate = new Date(chat.updateTime)
    const diffDays = getDateDiffInDays(chat.updateTime)
    const formattedChat = {
      id: chat.id,
      title: chat.chatHistory?.[0]?.content || '无标题'
    }

    if (diffDays === 0) {
      grouped.today.push(formattedChat)
    } else if (diffDays === 1) {
      grouped.yesterday.push(formattedChat)
    } else if (diffDays <= 7) {
      grouped.last7Days.push(formattedChat)
    } else {
      grouped.older.push(formattedChat)
    }
  })

  // 格式化分组为预期的输出
  const sessions = []

  if (grouped.today.length > 0) {
    sessions.push({
      label: '今天',
      items: grouped.today
    })
  }
  if (grouped.yesterday.length > 0) {
    sessions.push({
      label: '昨天',
      items: grouped.yesterday
    })
  }
  if (grouped.last7Days.length > 0) {
    sessions.push({
      label: '前 7 天',
      items: grouped.last7Days
    })
  }
  if (grouped.older.length > 0) {
    sessions.push({
      label: '更早',
      items: grouped.older
    })
  }
  return sessions
}

// 获取对话记录的函数
const getChatList = async () => {
  console.log('获取对话记录')
  try {
    const response = await axios.get('/air/promptCard/getChatList')
    if (response.data.code === 200) {
      chatList.value = response.data.data
      groupedSessions.value = groupChatSessions(chatList.value)
      console.log('对话记录:', groupedSessions.value)
    } else {
      console.error('请求失败:', response.data.msg)
    }
  } catch (err) {
    console.error('请求异常:', err)
  } finally {
    console.log('请求结束')
  }
}

const CreatChat = () => {
  router.replace({ path: '/empty' })  // 一个中转空页面
    .then(() => {
      router.replace('/card')
    })
}

// 根据id获取对话记录的函数
const getChatIDList = async (id) => {
  console.log('获取对话记录')
  try {
    const response = await axios.get('/air/promptCard/getChatById/' + id)
    if (response.data.code === 200) {
      const chatData = response.data.data
      chat.value.chatHistory = chatData.chatHistory
      info.value = []
      chat.value.chatHistory.forEach(item => {
        let resultText = item.content // 获取当前内容
        let infoType = item.role === "user" ? "leftinfo" : "rightinfo" // 根据 role 判断类型

        // 推入 info.value
        info.value.push({
          type: infoType,
          content: resultText,
          time: getCurrentTime() // 假设 getCurrentTime() 返回当前时间
        })
      })

      // 倒序赋值 chatHistory
      cards.value = chatData.reply[0].data
      // console.log('对话记录:', chatData.reply[0].data)
      cards.value = chatData.reply[0].data.map((item, index) => ({
        ...item,
        id: index + 1 
      }))
      recommend_cards.value = cards.value
        .slice(0, 3)
      // console.log('推荐卡片:', recommend_cards.value)
    } else {
      console.error('请求失败:', response.data.msg)
    }
  } catch (err) {
    console.error('请求异常:', err)
  } finally {
    console.log('请求结束')
  }
}

import { ElMessageBox, ElMessage } from 'element-plus'

const handleSessionCommand = async (id, command) => {
  if (command === 'delete') {
    try {
      await ElMessageBox.confirm('确认删除该会话？', '提示', {
        type: 'warning'
      })
      // 后端删除请求
      await axios.delete(`/air/promptCard/deleteChat/${id}`)
      // 前端移除
      chatList.value = chatList.value.filter(c => c.id !== id)
      groupedSessions.value = groupChatSessions(chatList.value)
      ElMessage.success('已删除')
    } catch {
      // 用户取消或请求失败
    }
  } else if (command === 'rename') {
    try {
      const { value } = await ElMessageBox.prompt('输入新的会话名称', '重命名', {
        inputPattern: /.+/,
        inputErrorMessage: '名称不能为空'
      })
      // 后端重命名请求
      await axios.put(`/air/promptCard/getChatById/${id}`, {
        title: value
      })

      // 前端更新
      const chat = chatList.value.find(c => c.id === id)
      if (chat) {
        chat.chatHistory[0].content = value // 假设名称来自第一条内容
        ElMessage.success('已重命名')
      }
    } catch {
      // 用户取消或请求失败
    }
  }
}


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
white-space: pre-line;  /* 保留换行符 */
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
padding: 10px;
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

/* .chat-float-window {
  position: fixed;
  bottom: 60px;
  right: 20px;
  width: 450px;
  max-width: 50vh;
  max-height: 35vh;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 9999;
  overflow: hidden;
}

.container, .main, .box {
  height: 100%;
  padding: 0px;
}

#content {
  height: auto;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
} */
.chat-float-window {
  position: fixed;
  bottom: 60px;
  right: 20px;
  /* width: 400px; */
  width: 22%;
  /* height: 400px; */
  height: 40%;
  max-width: 50vh;
  max-height: 50vh;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 9999;
  display: flex;
  flex-direction: column; /* 重点！让内部内容垂直排列 */
  overflow: hidden;
}

.container, .main, .box {
  height: 100%;
  min-height: 0; /* 修复flex项的最小高度问题 */
  display: flex;
  flex-direction: column;
  padding: 0px;
}

#content {
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许内容收缩 */
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box; /* 包含padding在高度计算中 */
}

.setproblem {
  padding: 10px;
  background: #f5f5f5;
}
.setproblems {
  position: absolute;
  right: 20px;
  bottom: 20px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 6px 20px;
  cursor: pointer;
}
.chat-toggle-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
}
.con_text {
  font-size: 12px;
}


.chat-sidebar {
  width: 10%;
  height: 100vh;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 12px;
}

.top-icons {
  display: flex;
  justify-content: space-around;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.chat-session-list {
  flex: 1;
  overflow-y: auto;
}

.group-title {
  font-size: 13px;
  color: #909399;
  margin: 12px 0 4px 8px;
}

.session-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-item:hover {
  background-color: #f2f6fc;
}

.session-item.active {
  background-color: #e0e0e0;
  color: #303133;
}

.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


/* .session-item {
  position: relative;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-item:hover {
  background-color: #f2f6fc;
}

.session-item.active {
  background-color: #e0e0e0;
  color: #303133;
}

.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-trigger {
  display: none;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
}

.session-item:hover .dropdown-trigger {
  display: block;
}
 */
.dropdown-trigger {
  /* display: none; */
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
}
.session-item:hover .dropdown-trigger {
  display: block;
}

.layout {
  display: flex;
  height: 100vh;
}
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

</style>
