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
            <div class="card-footer">
              <div class="audio-player" @click="handleAudio(item.id, item.answer)">
                <!-- <span class="play-icon">{{ isPlaying[item.id] ? '❚❚' : '▶' }}</span> -->
                <span class="play-icon">
                  <template v-if="isLoading[item.id]">⏳</template>
                  <template v-else-if="isPlaying[item.id]">❚❚</template>
                  <template v-else>▶</template>
                </span>
                <span class="time-display" style="margin-left: 5px;">
                  {{ formatTime(currentTime[item.id] || 0) }} / {{ formatTime(totalTime[item.id] || 0) }}
                </span>
              </div>
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
            <span class="recommend-text">{{ item.id }} {{ item.question }}</span>
              <!-- {{ item.id }} {{ item.question }} -->
            </el-menu-item>
          </el-menu>
      </el-col>
  </el-row>
  <div class="asr-container">
      <div class="asr-text">{{ micAsrText  || '🎤 请打开麦克风语音...' }}</div>
      <div class="asr-text">{{ sysAsrText  || '🎤 请打开系统音频语音...' }}</div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <!-- 麦克风设备选择 -->
        <el-select v-model="micDeviceId" placeholder="选择麦克风" style="width: 180px">
          <el-option
            v-for="device in micDevices"
            :key="device.deviceId"
            :label="device.label || '麦克风设备'"
            :value="device.deviceId"
          />
        </el-select>

        <!-- 麦克风录音按钮 -->
        <el-button 
          type="primary" 
          round 
          @click="toggleMicASR"
        >
          <div v-if="micActive === true"><el-icon><Microphone /></el-icon></div>
          <div v-else><el-icon><Mute /></el-icon></div>
          麦克风声音
        </el-button>

        <!-- 系统声音录制按钮 -->
        <el-button 
          type="success" 
          round 
          @click="toggleSysASR"
        >
          <div v-if="sysActive === true"><font-awesome-icon icon="fas fa-volume-up" /></div>
          <div v-else><font-awesome-icon icon="fas fa-volume-mute" /></div>
          系统声音
        </el-button>

        <!-- 系统音频设备选择 -->
        <el-select v-model="sysDeviceId" placeholder="选择系统输入" style="width: 180px">
          <el-option
            v-for="device in sysDevices"
            :key="device.deviceId"
            :label="device.label || '系统设备'"
            :value="device.deviceId"
          />
        </el-select>
      </div>
      <!-- <el-button 
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
          <div v-if="sysActive === true"><font-awesome-icon icon="fas fa-volume-up" /></div>
          <div v-else><font-awesome-icon icon="fas fa-volume-mute" /></div>
          系统声音
      </el-button> -->
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
                <!-- <img src="../../../public/people.png" alt="" class="circle circle_r" /> -->
                <img src="/people.png" alt="" class="circle circle_r" />
                <div class="con_r con_text" style="min-height: 5px;">
                  <div>{{ item.content }}</div>
                </div>
                <div class="time_r">{{ item.time }}</div>
              </div>

              <div class="info_l" v-else>
                <div class="con_r con_text">
                  <span class="con_l" style="min-height: 5px;">{{ item.content }}</span>
                  <span class="circle circle_l">
                    <img src="/chat.png" alt="" class="circle circle_r" />
                  </span>
                </div>
                <div class="time_l">{{ item.time }}</div>
              </div>
            </div>
              <!-- 实时识别展示 -->
            <!-- <div class="info_l" v-if="micActive && micAsrText && micAsrText !== ' ' ">
              <div class="con_r con_text">
                <span class="con_l">{{ micAsrText }}</span>
                <span class="circle circle_l">
                  <img src="../../../public/chat.png" alt="" class="circle circle_r" />
                </span>
              </div>
              <div class="time_l">{{ getCurrentTime() }}</div>
            </div>
            <div class="info_r info_default" v-if="sysActive && sysAsrText && sysAsrText !== ' ' ">
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
  ArrowUp
} from '@element-plus/icons-vue'
import { text } from '@fortawesome/fontawesome-svg-core'

// 响应式状态
const asrText = ref('')
const asrFinalText = ref('')
const asrActive = ref(false)
// const cards = ref<any[]>([])
const cards = ref([
  // {
  //   id: 1,
  //   question: '厦门大学的课程类型有哪些？',
  //   answer: '厦门大学的课程类型包括必修课、选修课、实践课等。',
  //   confidence: 'confirmed'
  // },
  // {
  //   id: 2,
  //   question: '厦门大学的学费是多少？',
  //   answer: '厦门大学的学费根据专业和年级不同而有所差异，一般在5000-20000元之间。',
  //   confidence: 'ai-generated'
  // }
])
const recommend_cards = ref<any[]>([])
const expandedIds = ref<number[]>([])

const micAsrText = ref('')
const micAsrFinalText = ref('')
const micActive = ref(false)

const sysAsrText = ref('')
const sysAsrFinalText = ref('')
const sysActive = ref(false)



// const chat = ref({
//   query: '我想了解下厦门大学课程有什么类型',
//   history: [
//     // { role: 'user', content: '你好' },
//     // { role: 'assistant', content: '你好！有什么我可以帮助你的吗？' }
//   ]
// })
const chat = ref({
  chatHistory: [
    // { role: 'user', content: '你好' },
    // { role: 'assistant', content: '你好！有什么我可以帮助你的吗？' }
  ]
})

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

const getRAGResult = async (chatParam: any) => {
  try {
    // const chatId = window.sessionStorage.getItem('chatId')
    const chatId = '80'
    console.log("chatParam:", chatParam)
    if(chatId){
      chatParam.id = chatId
    }
    const response = await axios.post('/air/promptCard/getPromptCards', chatParam)
    // console.log('RAG结果:', response.data.data[0])
    const results = response.data.data.results || []
    const maxId = Math.max(...cards.value.map(item => item.id), 0); // 获取当前cards数组中的最大ID
    const newItems = results.map((item: any, index: number) => ({
      ...item,
      idx: item.id,
      id: maxId + index + 1 // 生成新的id
    }));
    cards.value.unshift(...newItems);
    if (newItems.length > 0) {
      toggleExpand(newItems[0].id);
      recommend_cards.value = results.map((item: any, index: number) => ({
        ...item,
        idx: item.id,
        id: index + 1 
      }))
    }
    // recommend_cards.value = results.map((item: any, index: number) => ({
    //   ...item,
    //   id: index + 1 
    // }))

    // 更新 chat.chatHistory 最后一项的 replyIds
    const replyIds = response.data.data.replyIds || []
    const lastIndex = chat.value.chatHistory.length - 1
    if (lastIndex >= 0) {
      chat.value.chatHistory[lastIndex].replyIds = replyIds
    }
    // console.log('chat.id:', id)
    // if(!id){
    //   console.log('chat.id:', id)
    //   router.push(`/card/${response.data.data.chatId}`)
    // }
    // console.log('chat.chatHistory:', chat.value.chatHistory)
    
    if(!chatId){
      console.log('chatId:', chatId)
      window.sessionStorage.setItem('chatId',response.data.data.chatId)
    }
  } catch (error) {
    console.error('响应失败:', error)
  }
}

const saveChat = async (chatParam: any) => {
  try {
    // const chatId = window.sessionStorage.getItem('chatId')
    const chatId = '80'
    console.log("chatParam:", chatParam)
    if(chatId){
      chatParam.id = chatId
    }
    const response = await axios.post('/air/promptCard/getPromptCards', chatParam)
    console.log('结果:', response)
    
    if(!chatId){
      console.log('chatId:', chatId)
      window.sessionStorage.setItem('chatId',response.data.data.chatId)
    }
  } catch (error) {
    console.error('响应失败:', error)
  }
}

// 根据id获取对话记录的函数
const getChatIDList = async (id) => {
  console.log('获取对话记录')
  try {
    const response = await axios.get('/air/promptCard/getChatById/' + id)
    if (response.data.code === 200) {
      const chatData = response.data.data
      console.log('对话记录:', chatData)
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
        idx: item.id,
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

let micWebSocket: WebSocket
let micProcessor: ScriptProcessorNode
let micAudioContext: AudioContext
let micSampleBuf = new Int16Array()

import CryptoJS from 'crypto-js'
import md5 from 'crypto-js/md5'

const APPID = '7bbacce7'
const API_KEY = 'e7558fed3b8b89fb8d3f8c71951bbe88'

// function getWebSocketUrl() {
//   const url = 'wss://rtasr.xfyun.cn/v1/ws'
//   const ts = Math.floor(Date.now() / 1000)
//   const signa = md5(APPID + ts).toString()
//   const signatureSha = CryptoJS.HmacSHA1(signa, API_KEY)
//   const signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(signatureSha))
//   return `${url}?appid=${APPID}&ts=${ts}&signa=${signature}`
// }
function getWebSocketUrl(path) {
  const baseURL = axios.defaults.baseURL;
  if (!baseURL) {
    throw new Error('axios.defaults.baseURL 未设置');
  }
  const wsProtocol = baseURL.startsWith('https') ? 'wss' : 'ws';
  const base = baseURL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `${wsProtocol}://${base}${path}`;
}

const startMicASR = async () => {
  try {
    micAsrText.value = '';
    micAsrFinalText.value = '';

    // micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // console.log('micDeviceId.value:', micDeviceId.value)
    if (!micDeviceId.value) {
      alert('请先选择麦克风设备');
      return;
    }
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: micDeviceId.value ? { exact: micDeviceId.value } : undefined
      }
    });

    micAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    const micSource = micAudioContext.createMediaStreamSource(micStream);

    // const url = 'http://localhost:8080'
    // const url = 'wss://7f8c-2001-da8-e800-a3d8-35e6-ca73-10f8-d787.ngrok-free.app/asr'
    const url = getWebSocketUrl('/asr')
    console.log('WebSocket URL:', url);
    micWebSocket = new WebSocket(url);
    micWebSocket.binaryType = 'arraybuffer';

    // 连接建立后，通知后端启动识别任务
    micWebSocket.onopen = () => {
      console.log("✅ 前端与后端连接建立");
      micWebSocket.send(JSON.stringify({
        type: 'start-asr'
      }));
    };
    micWebSocket.onerror = (e) => {
      console.error("❌ WebSocket 错误", e);
      alert('无法启动麦克风识别，请检查麦克风权限');
      micActive.value = false;
      window.sessionStorage.setItem('micActive',false)
    };

    // 接收识别结果
    micWebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const jsonData = JSON.parse(event.data);
      if (jsonData.data.endTime === null) {
        micAsrText.value = jsonData.data.text; // 实时中间结果
        // console.log('实时中间识别：', jsonData.data);
      } else if (jsonData.data.endTime !== null) {
          let text = jsonData.data.text; // 最终识别结果
          text = removeLeadingPunctuation(text)
          micAsrFinalText.value +=  text + '\n'
          micAsrText.value = ' '
          chat.value.chatHistory.push({ role: 'assistant', content: text })
          // getRAGResult(chat.value)
          // saveChat(chat.value)
          info.value.push({
            type: "rightinfo",
            content: text,
            time: getCurrentTime()
          })
          // console.log('实时识别：', jsonData.data);
      } else if (jsonData.status === 'error') {
        // console.error('识别错误:', jsonData.message);
        micActive.value = false;
        window.sessionStorage.setItem('micActive',false)
      }
      // if (jsonData.type === 'asr-interim-result') {
      //   micAsrText.value = jsonData.result; // 实时中间结果
      //   console.log('实时中间识别：', jsonData.result);
      // } else if (jsonData.type === 'asr-final-result') {
      //     let text = jsonData.result; // 最终识别结果
      //     text = removeLeadingPunctuation(text)
      //     micAsrFinalText.value +=  text + '\n'
      //     micAsrText.value = ''
      //     chat.value.chatHistory.push({ role: 'assistant', content: text })
      //     info.value.push({
      //       type: "rightinfo",
      //       content: text,
      //       time: getCurrentTime()
      //     })
      //     console.log('实时识别：', jsonData.result);
      // } else if (jsonData.type === 'error') {
      //   console.error('识别错误:', jsonData.message);
      //   micActive.value = false;
      // }
    };

    // 录音处理逻辑（保持原样）
    micProcessor = micAudioContext.createScriptProcessor(4096, 1, 1);
    micProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const downsampled = downsampleBuffer(inputData, 48000, 16000);
      const pcm = new Int16Array(downsampled.length);

      for (let i = 0; i < downsampled.length; i++) {
        const s = Math.max(-1, Math.min(1, downsampled[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      micSampleBuf = Int16Array.from([...micSampleBuf, ...pcm]);
      while (micSampleBuf.length >= CHUNK_SIZE) {
        const chunk = micSampleBuf.slice(0, CHUNK_SIZE);
        micSampleBuf = micSampleBuf.slice(CHUNK_SIZE);

        if (micWebSocket.readyState === WebSocket.OPEN) {
          micWebSocket.send(chunk.buffer); // 二进制发送给后端
        }
      }
    };

    micSource.connect(micProcessor);
    micProcessor.connect(micAudioContext.destination);
    micActive.value = true;
    window.sessionStorage.setItem('micActive',true)

  } catch (err) {
    console.error(err);
    alert('无法启动麦克风识别，请检查麦克风权限');
    micActive.value = false;
    window.sessionStorage.setItem('micActive',false)
  }
};


// const startMicASR = async () => { // 原科大讯飞免费的asr
//   try {
//     micAsrText.value = ''
//     micAsrFinalText.value = ''

//     micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
//     micAudioContext = new (window.AudioContext || window.webkitAudioContext)()
//     const micSource = micAudioContext.createMediaStreamSource(micStream)

//     // const url = getWebSocketUrl()
//     // micWebSocket = new WebSocket(url)

//     micWebSocket = new WebSocket('wss://www.funasr.com:10096/')

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
//           chat.value.chatHistory.push({ role: 'assistant', content: text })
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


// const startMicASR = async () => { // 原免费的asr
//   try {
//     micAsrText.value = ''
//     micAsrFinalText.value = ''

//     micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
//     micAudioContext = new (window.AudioContext || window.webkitAudioContext)()
//     const micSource = micAudioContext.createMediaStreamSource(micStream)

//     const url = getWebSocketUrl()
//     micWebSocket = new WebSocket(url)
    
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

//     micWebSocket.onmessage = (resultData) => {
//       // console.log('mic 原始数据:', resultData)
//       let jsonData = JSON.parse(resultData.data);
//       if (jsonData.action == "started") {
//         // 握手成功
//         console.log("握手成功");
//       } else if (jsonData.action == "result") {
//         const data = JSON.parse(jsonData.data)
//         // console.log(data)
//         // 转写结果
//         let resultTextTemp = ""
//         data.cn.st.rt.forEach((j) => {
//           j.ws.forEach((k) => {
//             k.cw.forEach((l) => {
//               resultTextTemp += l.w;
//             });
//           });
//         });
//         micAsrText.value = resultTextTemp
//         console.log("micAsrText.value识别结果:", micAsrText.value);
//         let resultText = ""
//         if (data.cn.st.type == 0) {
//           // 【最终】识别结果：
//           resultText += resultTextTemp;
//           resultTextTemp = ""
//           resultText = removeLeadingPunctuation(resultText)
//           console.log("最终识别结果:", resultText);
//           micAsrFinalText.value +=  resultText + '\n'
//           micAsrText.value = ''
//           // chat.value.history.push({ role: 'assistant', content: resultText })
//           chat.value.chatHistory.push({ role: 'assistant', content: resultText })
//           info.value.push({
//             type: "rightinfo",
//             content: resultText,
//             time: getCurrentTime()
//           })
//         }
//       } else if (jsonData.action == "error") {
//         // 连接发生错误
//         console.log("出错了:", jsonData);
//         alert('无法启动麦克风识别，请检查麦克风权限')
//         micActive.value = false
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
  window.sessionStorage.setItem('micActive',false)
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

    // sysStream = await navigator.mediaDevices.getDisplayMedia({ audio: true })
    if (!sysDeviceId.value) {
      alert('请先选择系统设备');
      return;
    }
    sysStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: sysDeviceId.value ? { exact: sysDeviceId.value } : undefined
      }
    });

    sysAudioContext = new (window.AudioContext || window.webkitAudioContext)()
    const sysSource = sysAudioContext.createMediaStreamSource(sysStream)

    // const url = 'wss://7f8c-2001-da8-e800-a3d8-35e6-ca73-10f8-d787.ngrok-free.app/asr'
    // const url = 'ws://10.32.39.42:8081/asr'
    const url = getWebSocketUrl('/asr')
    sysWebSocket = new WebSocket(url);
    sysWebSocket.binaryType = 'arraybuffer'

    sysWebSocket.onopen = () => {
      console.log("✅ 前端与后端连接建立");
      sysWebSocket.send(JSON.stringify({
        type: 'start-asr'
      }));
    }
    sysWebSocket.onerror = (e) => {
      console.error("❌ WebSocket 错误", e);
      alert('无法启动系统声音识别');
      sysActive.value = false;
      window.sessionStorage.setItem('sysActive',false)
    };

    sysWebSocket.onmessage = (event) => {
      // console.log('sys 原始数据:', event.data)
      const data = JSON.parse(event.data);
      const jsonData = JSON.parse(event.data);
      // console.log('sys 原始数据:', jsonData.data.endTime)
      if (jsonData.data.endTime === null) {
          sysAsrText.value = jsonData.data.text; // 实时中间结果
      } else if (jsonData.data.endTime !== null) {
          let text = jsonData.data.text;; // 最终识别结果
          text = removeLeadingPunctuation(text)
          sysAsrFinalText.value += text + '\n'
          sysAsrText.value = ' '
          chat.value.chatHistory.push({
            role: 'user',
            content: text
          })
          // chat.value.query = text
          getRAGResult(chat.value)
          info.value.push({
            type: "leftinfo",
            content: text,
            time: getCurrentTime()
          })
      } else if (jsonData.status === 'error') {
        sysActive.value = false;
        window.sessionStorage.setItem('sysActive',false)
        console.error('识别错误:', jsonData.message);
      }
      // if (jsonData.type === 'asr-interim-result') {
      //     sysAsrText.value = jsonData.result
      // } else if (jsonData.type === 'asr-final-result') {
      //     let text = jsonData.result; // 最终识别结果
      //     text = removeLeadingPunctuation(text)
      //     sysAsrFinalText.value += text + '\n'
      //     sysAsrText.value = ''
      //     chat.value.chatHistory.push({
      //       role: 'user',
      //       content: text
      //     })
      //     // chat.value.query = text
      //     getRAGResult(chat.value)
      //     info.value.push({
      //       type: "leftinfo",
      //       content: text,
      //       time: getCurrentTime()
      //     })
      // } else if (jsonData.type === 'error') {
      //   sysActive.value = false;
      //   console.error('识别错误:', jsonData.message);
      // }
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
    window.sessionStorage.setItem('sysActive',true)
  } catch (err) {
    // alert('⚠️ 当前浏览器或系统可能不支持系统音频，请选择标签页并勾选共享音频')
    sysActive.value = false
    window.sessionStorage.setItem('sysActive',false)
  }
}

// const startSysASR = async () => { // 原科大讯飞免费的asr
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

//           chat.value.chatHistory.push({
//             role: 'user',
//             content: text
//           })
//           // chat.value.query = text
//           getRAGResult(chat.value)
//           // toggleExpand(1)
          
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

// const startSysASR = async () => { // 原免费的asr
//   try {
//     sysAsrText.value = ''
//     sysAsrFinalText.value = ''
//     // alert('请选择【浏览器标签页】，并勾选“共享标签页音频”')

//     sysStream = await navigator.mediaDevices.getDisplayMedia({ audio: true })
//     sysAudioContext = new (window.AudioContext || window.webkitAudioContext)()
//     const sysSource = sysAudioContext.createMediaStreamSource(sysStream)

//     const url = getWebSocketUrl()
//     sysWebSocket = new WebSocket(url)

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
//       let jsonData = JSON.parse(event.data);
//       if (jsonData.action == "started") {
//         // 握手成功
//         console.log("握手成功");
//       } else if (jsonData.action == "result") {
//         const data = JSON.parse(jsonData.data)
//         // console.log(data)
//         // 转写结果
//         let resultTextTemp = ""
//         data.cn.st.rt.forEach((j) => {
//           j.ws.forEach((k) => {
//             k.cw.forEach((l) => {
//               resultTextTemp += l.w;
//             });
//           });
//         });
//         sysAsrText.value = resultTextTemp
//         console.log("sysAsrText.value识别结果:", sysAsrText.value);
//         let resultText = ""
//         if (data.cn.st.type == 0) {
//           // 【最终】识别结果：
//           resultText += resultTextTemp;
//           resultTextTemp = ""
//           console.log("最终识别结果:", resultText);
//           resultText = removeLeadingPunctuation(resultText)
//           sysAsrFinalText.value +=  resultText + '\n'
//           sysAsrText.value = ''
//           // chat.value.query = resultText
//           chat.value.chatHistory.push({ role: 'user', content: resultText })
//           getRAGResult(chat.value)
//           // chat.value.history.push({ role: 'user', content: resultText })
//           info.value.push({
//             type: "leftinfo",
//             content: resultText,
//             time: getCurrentTime()
//           })
//         }
//       } else if (jsonData.action == "error") {
//         // 连接发生错误
//         console.log("出错了:", jsonData);
//         alert('无法启动麦克风识别，请检查麦克风权限')
//         sysActive.value = false
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
  window.sessionStorage.setItem('sysActive',false)
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

const micDevices = ref([])
const sysDevices = ref([])

const micDeviceId = ref('')
const sysDeviceId = ref('')

// const getAudioInputDevices = async () => {
//   const devices = await navigator.mediaDevices.enumerateDevices();
//   const audioInputs = devices.filter(d => d.kind === 'audioinput');
//   micDevices.value = audioInputs;
//   sysDevices.value = audioInputs;
//   return audioInputs
// };

const getAudioInputDevices = async () => {
  try {
    // 请求权限：必须有这一步
    await navigator.mediaDevices.getUserMedia({ audio: true });

    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');

    micDevices.value = audioInputs;
    sysDevices.value = audioInputs;

    return audioInputs;
  } catch (err) {
    console.error('获取麦克风权限失败:', err);
    return [];
  }
};


// 生命周期钩子
onMounted(() => {
  // getQa()
  // toggleExpand(1)
  // getRAGResult(chat.value)
  let temp = getAudioInputDevices()
  console.log(temp)
  window.sessionStorage.setItem('sysActive',false)
  window.sessionStorage.setItem('micActive',false)
  // const chatId = window.sessionStorage.getItem('chatId')
  const chatId = '80'
  if(chatId){
    console.log('chatId:', chatId)
    getChatIDList(chatId)
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

onBeforeUnmount(() => {
  console.log('beforeunload')
  saveChat(chat.value)
})

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

// 点击推荐问题
const clickRobot = (text, id) => {
  customerText.value = text
  sentMsg()
}

const isPlaying = ref({});
const currentTime = ref({});
const totalTime = ref({});
const audioMap = ref({});  // 每条音频的 Audio 实例
const audioUrlMap = ref({});  // 每条记录的音频 URL
const isLoading = ref({}) // 每个音频项的 loading 状态

let timerMap = {};  // 每条记录独立定时器

const handleAudio = async (id, answer) => {
  // id = parseInt(cards.value[id].idx)
  // console.log(cards.value)
  console.log('handleAudio', id, answer)
  if (!audioUrlMap.value[id]) {
    // 设置加载中
    isLoading.value[id] = true;

    try {
      const formData = new FormData();
      formData.append('QaId', parseInt(cards.value[id-1].idx));
      formData.append('answer', answer);
      
      // console.log(parseInt(cards.value[id].idx))

      const res = await axios.post('/air/copyVocie/tts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      let data = res.data;
      console.log('生成音频数据：', data);

      if (data.code === 200) {
        const audioUrl = axios.defaults.baseURL + data.data.audioUrl;
        audioUrlMap.value[id] = audioUrl;

        const audio = new Audio(audioUrl);
        audioMap.value[id] = audio;

        audio.addEventListener('loadedmetadata', () => {
          totalTime.value[id] = Math.floor(audio.duration);
          // 取消加载中
          isLoading.value[id] = false;
          playAudio(id);
        });
      } else {
        isLoading.value[id] = false;
        alert(data.msg || '音频生成失败');
      }
    } catch (err) {
      console.error('生成音频失败：', err);
      isLoading.value[id] = false;
    }
  } else {
    if (!isPlaying.value[id]) {
      playAudio(id);
    } else {
      pauseAudio(id);
    }
  }
}

const playAudio = (id) => {
  const audio = audioMap.value[id];
  if (!audio) return;

  audio.play();
  isPlaying.value[id] = true;

  timerMap[id] = setInterval(() => {
    currentTime.value[id] = Math.floor(audio.currentTime);
  }, 1000);

  audio.onended = () => {
    clearInterval(timerMap[id]);
    isPlaying.value[id] = false;
    currentTime.value[id] = 0;
  };
};

const pauseAudio = (id) => {
  const audio = audioMap.value[id];
  if (!audio) return;

  audio.pause();
  isPlaying.value[id] = false;
  clearInterval(timerMap[id]);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

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
min-height: 20px; /* ✅ 设置一个你希望的最小宽度 */
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
/* .card-footer {
display: flex;
gap: 10px;
align-items: center;
margin-top: 10px;
} */
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
.recommend-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.footer {
display: flex;
align-items: center;
gap: 10px;
padding-top: 20px;
font-size: 14px;
color: #666;
}
.card-footer {
  position: absolute;
  right: 20px;
  bottom: 15px;
  font-size: 14px;
  color: #999;
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
  width: 450px;
  height: 400px;
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

</style>