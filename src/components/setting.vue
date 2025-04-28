<template>
    <div class="user-settings-view">
      <div class="settings-container">
        <div class="section">
          <h3>账户设置</h3>
          <div class="setting-item">
            <span>用户名</span>
            <el-input v-model="username" placeholder="请输入用户名" />
          </div>
          <div class="setting-item">
            <span>修改密码</span>
            <el-input v-model="password" placeholder="请输入新密码" />
          </div>
        </div>
  
        <div class="section">
          <h3>显示设置</h3>
          <div class="setting-item">
            <span>提示卡片数量</span>
            <el-slider v-model="cardCount" :min="0" :max="10" show-input />
          </div>
          <el-button type="primary" class="save-button">保存设置</el-button>
        </div>
      </div>
  
        <div class="system-test-view">
            <div class="test-container">
            <!-- 系统测试部分 -->
            <div class="test-section">
                <span class="section-title">系统测试</span>
                <el-button type="primary" class="test-button">开始测试</el-button>
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
  </template>
  
  <script>
  import { ref } from 'vue'
  import { StarFilled } from '@element-plus/icons-vue'
  
  export default {
    components: { StarFilled },
    setup() {
      const username = ref('')
      const password = ref('')
      const cardCount = ref(10)
      const activeTab = ref('reference')
      const activeCollapse = ref(['1'])
  
      return {
        username,
        password,
        cardCount,
        activeTab,
        activeCollapse
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