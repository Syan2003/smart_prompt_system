<template>
    <div class="knowledge-table-view">
      <div class="filter-bar">
        <el-button :type="activeFilter === 'all' ? 'primary' : 'default'" @click="setFilter('all')">全部</el-button>
        <el-button :type="activeFilter === 'confirmed' ? 'primary' : 'default'" @click="setFilter('confirmed')">已验证</el-button>
        <el-button :type="activeFilter === 'generated' ? 'primary' : 'default'" @click="setFilter('generated')">待验证</el-button>
        <el-button :type="activeFilter === 'tofill' ? 'primary' : 'default'" @click="setFilter('tofill')">待补充</el-button>
        <el-button type="success" @click="openCreateDialog">新建</el-button>
        <el-input
            v-model="input4"
            style="width: 240px"
            placeholder="搜索..."
            class="search-input"
        >
            <template #prefix>
                <el-icon class="el-input__icon"><search /></el-icon>
            </template>
        </el-input>
      </div>
  
      <el-table :data="filteredData" stripe style="width: 100%">
        <el-table-column prop="question" label="问题" />
        <el-table-column prop="answer" label="答案" />
        <el-table-column prop="update_time" label="日期" />
        <el-table-column label="状态">
            <template #default="scope">
                <el-tag :type="tagType(scope.row.confidence)">
                  <div v-if="scope.row.confidence === 'confirmed'">已验证</div>
                  <div v-if="scope.row.confidence === 'tofill'">待补充</div>
                  <div v-if="scope.row.confidence === 'generated'">待验证</div>
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <!-- <el-button text @click="VerifyDialog(scope.row)">
              <el-icon><Stamp /></el-icon>
            </el-button> -->
            <el-popconfirm
              v-if="scope.row.confidence === 'generated'"
              confirm-button-text="Yes"
              cancel-button-text="No"
              :icon="InfoFilled"
              icon-color="#626AEF"
              title="设置为已验证"
              @confirm="VerifyDialog(scope.row)"
              @cancel="cancelEvent"
            >
              <template #reference>
                <el-button text><el-icon><Stamp /></el-icon></el-button>
              </template>
            </el-popconfirm>
            <el-button text @click="openEditDialog(scope.row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button text @click="confirmDelete(scope.row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
        v-model="okDeleteCard"
        width="40%"
        align-center
        title="请检查核验"
      >
        <template v-if="rowToDelete">
          <div class="confirm-content">
            <div class="confirm-title">{{ rowToDelete.question }}</div>
            <div class="confirm-body">
              <p>{{ rowToDelete.answer }}</p>
            </div>
            <div class="confirm-status">
              <el-icon style="color: green"><Check /></el-icon>
              <span class="verified-text">已验证</span>
            </div>
          </div>
        </template>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="okDeleteCard = false">取消</el-button>
            <el-button type="primary" @click="DeleteCardConfirm">确定</el-button>
          </span>
        </template>
      </el-dialog>
      <el-dialog
        v-model="okEditCard"
        title="编辑知识问答"
        width="50%"
      >
        <el-form
          :model="editForm"
          label-width="100px"
          class="form_style"
        >
          <el-form-item label="问题" prop="question">
            <el-input
              type="textarea"
              v-model="editForm.question"
              placeholder="请输入问题"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </el-form-item>

          <el-form-item label="答案" prop="answer">
            <el-input
              type="textarea"
              v-model="editForm.answer"
              placeholder="请输入答案"
              :autosize="{ minRows: 4, maxRows: 6 }"
            />
          </el-form-item>

          <el-form-item label="验证状态" prop="confidence">
            <el-select v-model="editForm.confidence" placeholder="请选择验证状态">
              <el-option label="已验证" value="confirmed" />
              <el-option label="待验证" value="generated" />
              <el-option label="待补充" value="tofill" />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="标签" prop="tags">
            <el-select
              v-model="editForm.tags"
              multiple
              placeholder="请选择标签"
              allow-create
              default-first-option
            >
              <el-option
                v-for="tag in tagOptions"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="最后更新时间">
            <el-input v-model="editForm.update_time" disabled />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="okEditCard = false">取消</el-button>
            <el-button type="primary" @click="EditQaConfirm">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
      <el-dialog
        v-model="okCreateCard"
        title="新建知识问答"
        width="50%"
      >
        <el-form
          :model="createForm"
          :rules="formRules"
          ref="createFormRef"
          label-width="100px"
          class="form_style"
        >
          <el-form-item label="问题" prop="question">
            <el-input
              type="textarea"
              v-model="createForm.question"
              placeholder="请输入问题"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </el-form-item>

          <el-form-item label="答案" prop="answer">
            <el-input
              type="textarea"
              v-model="createForm.answer"
              placeholder="请输入答案"
              :autosize="{ minRows: 4, maxRows: 6 }"
            />
          </el-form-item>

          <el-form-item label="验证状态" prop="confidence">
            <el-select v-model="createForm.confidence" placeholder="请选择验证状态">
              <el-option label="已验证" value="confirmed" />
              <el-option label="待验证" value="generated" />
              <el-option label="待补充" value="tofill" />
            </el-select>
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="okCreateCard = false">取消</el-button>
            <el-button type="primary" @click="CreateQaConfirm">创建</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
<script>
import { Edit, Delete, Search, Check, Stamp } from '@element-plus/icons-vue'

export default {
    components: { Edit, Delete, Search, Check, Stamp },
    data() {
      return {
          activeFilter: 'all',
          search: '',
          tableData: [
            // {
            //     question: '如何导出知识库数据?',
            //     answer: '点击导出按钮，选择导出格式...',
            //     confidence: 'confirmed',
            //     statusLabel: '已验证',
            // },
            // {
            //     question: '系统支持多少种语言?',
            //     answer: '目前支持中文和英文两种语言...',
            //     confidence: 'generated',
            //     statusLabel: '待验证',
            // }
          ],
          okDeleteCard: false,         // 控制弹窗显示
          rowToDelete: null,            // 要删除的当前行
          okEditCard: false,
          editForm: {
            question: '',
            answer: '',
            confidence: '',
            tags: [],
            update_time: ''
          },
          okCreateCard: false,
          createForm: {
            question: '',
            answer: '',
            confidence: '',
            update_time: ''
          },
          formRules: {
            question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
            answer: [{ required: true, message: '请输入答案', trigger: 'blur' }],
            confidence: [{ required: true, message: '请选择验证状态', trigger: 'change' }]
          }
      }
    },
    created() {
        this.getQa()
    },
    computed: {
      filteredData() {
        return this.tableData
          .filter(row => {
            const matchFilter = this.activeFilter === 'all' || row.confidence === this.activeFilter
            const matchSearch = row.question.includes(this.search) || row.answer.includes(this.search)
            return matchFilter && matchSearch
          })
          .sort((a, b) => new Date(b.update_time).getTime() - new Date(a.update_time).getTime()) // 升序
      }
    },
    methods: {
        async getQa(){
            const {data: res} = await this.$axios.get('/air/knowledge/list')
            if(res.code !== 200) return  this.$message.error(res.msg)
            this.$message.success(res.msg)
            this.tableData = res.rows
            console.log(this.tableData)
        },
        tagType(confidence) {
            switch (confidence) {
                case 'confirmed': return 'success'
                case 'generated': return 'warning'
                case 'tofill': return 'info'
                default: return 'default'
            }
        },
        setFilter(filter) {
            this.activeFilter = filter
        },
        confirmDelete(row) {
          this.rowToDelete = row
          this.okDeleteCard = true
        },
        DeleteCardConfirm() {
          const id = this.rowToDelete.id
          this.$axios.delete(`/air/knowledge/${id}`)
            .then(res => {
              if (res.data.code !== 200) {
                this.$message.error(res.data.msg)
                return
              }
              // 删除成功，从 tableData 中移除
              const index = this.tableData.findIndex(item => item.id === id)
              if (index !== -1) {
                this.tableData.splice(index, 1)
              }
              this.$message.success('删除成功')
            })
            .catch(error => {
              console.error('删除失败:', error)
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.okDeleteCard = false
              this.rowToDelete = null
            })
        },
        openEditDialog(row) {
          this.editForm = { ...row }  // 深拷贝当前行的数据
          this.okEditCard = true
        },
        EditQaConfirm() {
          const id = this.editForm.id
          const updatedData = {
            ...this.editForm,
            update_time: this.getCurrentTime()
          }

          this.$axios.put(`/air/knowledge/updateQa/${id}`, updatedData)
            .then(res => {
              if (res.data.code !== 200) {
                this.$message.error(res.data.msg)
                return
              }

              this.$message.success('修改成功')

              const index = this.tableData.findIndex(item => item.id === id)
              if (index !== -1) {
                this.tableData.splice(index, 1, updatedData)
              }

              this.okEditCard = false
            })
            .catch(error => {
              console.error('修改失败:', error)
              this.$message.error('修改失败')
            })
        },
        VerifyDialog(row) {
          const updatedRow = {
            ...row,
            confidence: 'confirmed',
            update_time: this.getCurrentTime()
          }

          this.$axios.put(`/air/knowledge/updateQa/${row.id}`, updatedRow)
            .then(res => {
              if (res.data.code !== 200) {
                this.$message.error(res.data.msg)
                return
              }

              this.$message.success('已设置为已验证')

              const index = this.tableData.findIndex(item => item.id === row.id)
              if (index !== -1) {
                this.tableData.splice(index, 1, updatedRow)
              }
            })
            .catch(error => {
              console.error('验证更新失败:', error)
              this.$message.error('更新失败')
            })
        },
        getCurrentTime() {
          const now = new Date()
          const pad = (n) => n.toString().padStart(2, '0')
          const yyyy = now.getFullYear()
          const MM = pad(now.getMonth() + 1)
          const dd = pad(now.getDate())
          const hh = pad(now.getHours())
          const mm = pad(now.getMinutes())
          const ss = pad(now.getSeconds())
          return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`
        },
        openCreateDialog() {
          this.createForm = {
            question: '',
            answer: '',
            confidence: '',
            update_time: ''
          }
          this.okCreateCard = true
        },
        CreateQaConfirm() {
          this.$refs.createFormRef.validate((valid) => {
            if (valid) {
              this.createForm.update_time = this.getCurrentTime()
              this.$axios.post('/air/knowledge/addQa', this.createForm)
                .then(res => {
                  if (res.data.code !== 200) {
                    this.$message.error(res.data.msg)
                    return
                  }
                  this.getQa()
                  this.$message.success('新建成功')
                  this.tableData.unshift({
                    ...this.createForm,
                    id: res.data.data?.id || Date.now()  // 假如后端返回新ID
                  })
                  this.okCreateCard = false
                })
                .catch(error => {
                  console.error('创建失败:', error)
                  this.$message.error('创建失败')
                })
              }
          })
        }
    },
    setup() {

    }
}
</script>
  
<style scoped>
.knowledge-table-view {
  padding: 20px;
  background: #f9f9f9;
  min-height: 100vh;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.search-input {
  margin-left: auto;
  width: 250px;
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

.verified-text {
  margin-left: 5px;
}

.action-icons {
  position: absolute;
  bottom: 10px;
  right: 20px;
  display: flex;
  gap: 10px;
}

</style>
  