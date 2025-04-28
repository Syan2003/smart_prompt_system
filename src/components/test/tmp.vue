<template>
    <div class="container text-center">
        <h2>Mic and/or Speaker Recorder</h2>
        <div class="mb-2">
            <el-button 
                id="btn-start-recording" 
                type="primary" 
                round 
                :disabled="isRecording"
                @click="startRecording"
            >
                Start Recording
            </el-button>
            <el-button 
                id="btn-stop-recording" 
                type="danger" 
                round 
                :disabled="!isRecording"
                @click="stopRecording"
            >
                Stop Recording
            </el-button>
        </div>
        <audio class="mt-2" controls :src="audioUrl"></audio>
    </div>
</template>
  
<script>
// https://github.com/velor2012/anonymous-chat-room 共享聊天室
// https://github.com/asrul10/mic-speaker-recorder
import { ref } from 'vue';

export default {
    name: 'AudioRecorder',
    setup() {
        const audioUrl = ref('');
        const isRecording = ref(false);
        let micSpeakerRecorder = null;

        const config = {
            speaker: true,
            mic: true
        };

        const initializeRecorder = () => {
            micSpeakerRecorder = new MicSpeakerRecorder(
                config,
                () => {
                    // Recording started callback
                    isRecording.value = true;
                    console.log("Recording callback here!");
                },
                (blobData) => {
                    // Recording stopped callback
                    isRecording.value = false;
                    audioUrl.value = URL.createObjectURL(blobData);
                    console.log("Stop recording callback here!");
                },
                () => {
                    // Error callback
                    isRecording.value = false;
                    console.log("Error callback here!");
                }
            );
        };

        const startRecording = () => {
            if (!micSpeakerRecorder) {
                initializeRecorder();
            }
            micSpeakerRecorder.start();
        };

        const stopRecording = () => {
            if (micSpeakerRecorder) {
                micSpeakerRecorder.stop();
            }
        };
        return {
            audioUrl,
            isRecording,
            startRecording,
            stopRecording
        };
    }
};
</script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .text-center {
    text-align: center;
  }
  .mb-2 {
    margin-bottom: 1rem;
  }
  .mt-2 {
    margin-top: 1rem;
  }
  </style>