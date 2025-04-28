<template>
    <div class="file-upload-view">
      <div class="filter-bar">
        <el-button :type="activeFilter === 'all' ? 'primary' : 'default'" @click="setFilter('all')">全部</el-button>
        <el-button :type="activeFilter === 'verified' ? 'primary' : 'default'" @click="setFilter('verified')">已验证</el-button>
        <el-button :type="activeFilter === 'pending' ? 'primary' : 'default'" @click="setFilter('pending')">处理中</el-button>
        <el-input
            v-model="search"
            style="width: 150px"
            placeholder="搜索..."
            class="search-input"
        >
          <template #prefix>
            <el-icon class="el-input__icon"><search /></el-icon>
          </template>
        </el-input>
      </div>
  
      <div class="upload-area">
        <el-upload
            class="upload-demo"
            drag
            action=""
            multiple
            :auto-upload="true"
            :on-change="handleFileChange"
            :http-request="uploadFile"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
            <div class="el-upload__tip">
                支持格式：Excel、PDF、Word、TXT
            </div>
            </template>
        </el-upload>
      </div>
  
      <div class="file-list">
        <div v-for="file in filteredFiles" :key="file.name" class="file-item">
          <div class="file-info">
            <el-icon><Document /></el-icon>
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-time">{{ file.time }}</span>
            </div>
          </div>
          <div class="file-actions">
            <el-button text type="success" v-if="file.status === 'verified'">{{ file.statusLabel }}</el-button>
            <el-button text type="warning" v-if="file.status === 'pending'">{{ file.statusLabel }}</el-button>
            <el-popconfirm
              confirm-button-text="Yes"
              cancel-button-text="No"
              :icon="InfoFilled"
              icon-color="#626AEF"
              title="确认删除该文件？"
              @confirm="DeleteDoc(file)"
              @cancel="cancelEvent"
            >
              <template #reference>
                <el-button text><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script>
import axios from 'axios'
import { Document, Delete, Search, UploadFilled, InfoFilled } from '@element-plus/icons-vue'

export default {
  components: { Document, Delete, Search, UploadFilled, InfoFilled },
  data() {
    return {
      activeFilter: 'all',
      search: '',
      files: []
    }
  },
  computed: {
    filteredFiles() {
      return this.files.filter(file => {
        const matchFilter = this.activeFilter === 'all' || file.status === this.activeFilter
        const matchSearch = file.name.includes(this.search)
        return matchFilter && matchSearch
      })
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    }
  },
  mounted() {
    this.getFileList()
  },
  methods: {
    setFilter(filter) {
      this.activeFilter = filter
    },
    async getFileList() {
      try {
        const { data } = await axios.get('/air/doc/list')
        if (data.code !== 200) return this.$message.error(data.msg || '获取失败')
        this.files = data.rows.map(file => ({
          name: file.fileName,
          time: this.formatDate(file.uploadTime),
          status: file.status === 0 ? 'verified' : 'pending',
          statusLabel: file.status === 0 ? '处理完成' : '处理中',
          fileUuId: file.fileUuId
        }))
      } catch (err) {
        console.error('获取文件列表失败:', err)
        this.$message.error('文件加载失败')
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const yyyy = date.getFullYear()
      const MM = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      return `${yyyy}-${MM}-${dd} ${hh}:${mm}`
    },
    async uploadFile({ file }) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axios.post('/air/doc/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        this.$message.success('上传成功')
        this.getFileList()
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error('上传失败')
      }
    },
    handleFileChange(file) {
      console.log('文件变化:', file)
    },
    async DeleteDoc(file) {
      try {
        const { data } = await axios.delete(`/air/doc/${file.fileUuId}`)
        if (data.code !== 200) return this.$message.error(data.msg || '删除失败')

        this.$message.success('删除成功')
        this.files = this.files.filter(f => f.fileUuId !== file.fileUuId)
      } catch (err) {
        console.error('删除失败:', err)
        this.$message.error('删除失败')
      }
    },
    cancelEvent() {
      this.$message.info('取消删除')
    }
  }
}
</script>
  
  
  <style scoped>
  .file-upload-view {
    padding: 20px;
    background: #fff;
  }
  
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .search-input {
    margin-left: auto;
    width: 150px;
  }
  
  .upload-area {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    text-align: center;
    padding: 40px;
    margin-bottom: 20px;
  }
  
  .upload-title {
    font-size: 16px;
    color: #606266;
    margin-bottom: 10px;
  }
  
  .upload-button {
    margin-bottom: 10px;
  }
  
  .upload-support {
    font-size: 14px;
    color: #909399;
  }
  
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .file-details {
    display: flex;
    flex-direction: column;
  }
  
  .file-name {
    font-size: 14px;
    color: #606266;
  }
  
  .file-time {
    font-size: 12px;
    color: #909399;
  }
  
  .file-actions {
    display: flex;
    gap: 5px;
  }
  </style>