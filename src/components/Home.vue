<template>
    <el-container class="app-container">
        <el-header class="header">
            <div class="logo">
                <!-- <el-icon><Search /></el-icon> -->
                <el-button type="primary">Q</el-button>
                <div style="margin-left: 10px;">智能提示系统</div>
            </div>
            <el-menu mode="horizontal" class="nav" :default-active="activeMenu" @select="handleMenuSelect" ref="menuRef">
                <el-menu-item index="card">提示卡片</el-menu-item>
                <el-menu-item index="knowledge">知识管理</el-menu-item>
                <el-menu-item index="doc">文档管理</el-menu-item>
                <!-- <el-menu-item index="setting">系统设置</el-menu-item> -->
            </el-menu>
            <div class="user">
                <el-avatar :size="30" icon="el-icon-user-solid" />
                <span>张三</span>
            </div>
        </el-header>
        <el-main class="main">
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<script>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
export default {
  components: {
    Search
  },
  setup() {
    const router = useRouter()
    const activeMenu = ref('card')
    const menuRef = ref(null)
    
    const handleMenuSelect = (key) => {
      let micActive = window.sessionStorage.getItem('micActive')
      let sysActive = window.sessionStorage.getItem('sysActive')
      if(key === 'knowledge' || key === 'doc') {
        if(micActive === 'true') {
          ElMessage.warning('请先关闭语音识别')
          menuRef.value?.updateActiveIndex(activeMenu.value)
          return 
        }
        else if(sysActive === 'true') {
          ElMessage.warning('请先关闭系统语音识别')
          menuRef.value?.updateActiveIndex(activeMenu.value)
          return 
        }
      }
      activeMenu.value = key
      console.log(activeMenu.value)
      router.push(`/${key}`)
    }

    return {
      activeMenu,
      handleMenuSelect,
      menuRef 
    }
  }
}
</script>
  
  <style scoped>
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
    width: 400px;
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
    /* padding: 0px; */
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
  </style>
  