const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

const DASH_API_KEY = 'sk-028b379fab454e27977baa5dfbc70169'; // 建议使用环境变量安全管理
const DASH_WS_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
const PORT = 3001;

// const wss = new WebSocket.Server({ port: PORT }, () => {
//   console.log(`✅ WebSocket 服务器已启动：ws://localhost:${PORT}`);
// });

const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(8080, () => {
    console.log('HTTP + WebSocket 服务运行在 http://localhost:8080');
});

wss.on('connection', (client) => {
  console.log('🌐 前端已连接');

  let dashSocket = null;
  let dashReady = false;
  const taskId = uuidv4().replace(/-/g, '').slice(0, 32);

  client.on('message', async (message, isBinary) => {
    if (!isBinary) {
      const data = JSON.parse(message.toString());

      if (data.type === 'start-asr') {
        // 初始化连接 DashScope
        dashSocket = new WebSocket(DASH_WS_URL, {
          headers: {
            Authorization: `bearer ${DASH_API_KEY}`,
            'X-DashScope-DataInspection': 'enable',
          }
        });

        dashSocket.on('open', () => {
          console.log('✅ DashScope 连接成功');

          dashSocket.send(JSON.stringify({
            header: {
              action: 'run-task',
              task_id: taskId,
              streaming: 'duplex',
            },
            payload: {
              task_group: 'audio',
              task: 'asr',
              function: 'recognition',
              model: 'paraformer-realtime-v2',
              parameters: {
                sample_rate: 16000,
                format: 'pcm',
              },
              input: {}
            }
          }));
        });

        dashSocket.on('message', (data) => {
          const msg = JSON.parse(data);
          const event = msg.header.event;

          if (event === 'task-started') {
            dashReady = true;
            console.log('🎤 DashScope 任务已开始');
          } else if (event === 'result-generated') {
            const sentence = msg.payload?.output?.sentence;
            const text = sentence?.text;
            const endTime = sentence?.end_time;

            if (text) {
              // 中间结果：endTime 为空
              if (endTime === null) {
                console.log('📝 中间结果:', text);
                client.send(JSON.stringify({ type: 'asr-interim-result', result: text }));
              }
              // 最终结果：endTime 不为空
              else {
                console.log('✅ 最终结果:', text);
                client.send(JSON.stringify({ type: 'asr-final-result', result: text }));
              }
            }
          } else if (event === 'task-finished') {
            console.log('✅ DashScope 任务完成');
            client.send(JSON.stringify({ type: 'asr-end' }));
            dashSocket.close();
          } else if (event === 'task-failed') {
            console.error('❌ DashScope 错误：', msg.header.error_message);
            client.send(JSON.stringify({ type: 'error', message: msg.header.error_message }));
            dashSocket.close();
          }
        });

        dashSocket.on('error', (err) => {
          console.error('DashScope 连接错误：', err.message);
          client.send(JSON.stringify({ type: 'error', message: err.message }));
        });
      }

    } else {
      // 接收音频流数据并发送到 DashScope
      if (dashReady && dashSocket && dashSocket.readyState === WebSocket.OPEN) {
        dashSocket.send(message); // 转发音频 Buffer
      }
    }
  });

  client.on('close', () => {
    console.log('❎ 前端关闭连接');
    if (dashSocket && dashSocket.readyState === WebSocket.OPEN) {
      dashSocket.send(JSON.stringify({
        header: {
          action: 'finish-task',
          task_id: taskId,
          streaming: 'duplex'
        },
        payload: { input: {} }
      }));
      dashSocket.close();
    }
  });

  client.on('error', (err) => {
    console.error('客户端连接出错：', err);
  });
});
