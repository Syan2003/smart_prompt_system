 
<template>
    <el-card style="max-width: 100%">
        <el-card>
          <el-row>
              <el-col :span="4">
                  <div>
                      <el-button type="danger" @click="DeleteSchedules"><el-icon><Delete /></el-icon>批量删除</el-button>
                  </div>
              </el-col>
          </el-row>
          <el-row>
              <el-table v-loading="loading" :data="schedule_list" style="width: 100%" @selection-change="handleSelectionUserChange">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="id" label="ID" width="200" />
                  <el-table-column prop="userid" label="用户id" width="200" />
                  <el-table-column prop="" label="用户昵称" width="300" >
                    <template #default="scope">
                        <span>{{ this.UserList[scope.row.userid] }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="message" label="对话信息" width="200">
                      <template #default="scope">
                          <el-button size="small" @click="ViewChat(scope.row.message)"
                          >查看</el-button
                          >
                      </template>
                  </el-table-column>
                  <el-table-column prop="edit" label="Edit" width="200">
                      <template #default="scope">
                          <el-popconfirm title="温馨提示：您确定删除此项对话吗" @confirm="this.chatForm =scope.row;deleteChat(scope.row.id)">
                                <template #reference>
                                    <el-button type="danger" circle><el-icon><Delete /></el-icon></el-button>
                                </template>
                            </el-popconfirm>
                      </template>
                  </el-table-column>
              </el-table>
              <!-- <el-pagination
                    v-model:current-page="queryPage.page"
                    v-model:page-size="queryPage.size"
                    :page-sizes="[5, 10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="TotalPages"
                    @size-change="handleSizeUserChange"
                    @current-change="handleCurrentUserChange"
                    /> -->
          </el-row>
      </el-card>
    </el-card>
    <el-dialog
        v-model="editSchedule"
        title="编辑日程"
        width="40%"
    >
        <el-form ref="ScheduleRef" :rules="ScheduleRules" :model="addScheduleForm" label-width="80px" class="form_style">
            <el-form-item label="类型" prop="event_type">
                <el-col :span="20">
                    <el-input v-model="addScheduleForm.event_type" placeholder="请输入类型（例如：公共日程）"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="地点" prop="location">
                <el-col :span="20">
                    <el-input v-model="addScheduleForm.location" placeholder="请输入地点"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="开始时间" prop="start_time">
                <el-col :span="20">
                    <div class="block">
                        <el-date-picker
                            v-model="addScheduleForm.start_time"
                            type="datetime"
                            placeholder="选择开始时间"
                        />
                    </div>
                </el-col>
            </el-form-item>
            <el-form-item label="结束时间" prop="end_time">
                <el-col :span="20">
                    <div class="block">
                        <el-date-picker
                            v-model="addScheduleForm.end_time"
                            type="datetime"
                            placeholder="选择结束时间"
                        />
                    </div>
                </el-col>
            </el-form-item>
            <el-form-item label="日程描述" prop="description">
                <el-col :span="20">
                    <el-input v-model="addScheduleForm.description" placeholder="请输入描述"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="完成状态">
                <el-col :span="20">
                    <el-select
                        v-model="ScheduleState"
                        placeholder="Select"
                        size="large"
                        style="width: 240px"
                    >
                        <el-option
                            v-for="val in ScheduleStatelist"
                            :key="val.value"
                            :label="val.label"
                            :value="val.value"
                        />
                    </el-select>
                </el-col>
            </el-form-item>

        </el-form>
        <template #footer>
        <span class="dialog-footer">
            <el-button @click="editSchedule = false">取消</el-button>
            <el-button type="primary" @click="editScheduleList">
            确定
            </el-button>
        </span>
        </template>
    </el-dialog>
    <el-dialog
            v-model="okDeleteSchedules"
            width="30%"
            align-center
            title="温馨提示"
            >
            <span>你确定要删除选中项吗？</span>
            <template #footer>
                <span class="dialog-footer">
                <el-button @click="okDeleteSchedules = false">取消</el-button>
                <el-button type="primary" @click="ConfirmDeleteSchedules">
                    确定
                </el-button>
                </span>
            </template>
        </el-dialog>
    <el-dialog
        v-model="okViewChat"
        width="30%"
        align-center
        title="对话详情"
        >
        <el-input
            v-model="textarea"
            style="width: 400px;"
            :rows="20"
            type="textarea"
            clearable 
            disabled
        />
    </el-dialog>
</template>
<script>
import { Edit,Delete,Plus } from '@element-plus/icons-vue'

export default{
    components: { Edit,Delete,Plus },
    data() {
        return {
            radio1:1,
            schedule_list:[
                // {
                //     id, event_type, location, start_time, end_time, description, state, userid
                // },
            ],
            addScheduleForm:{
                event_type:'公共日程',
                location:'公司',
                start_time:'2024-03-25',
                end_time:'2024-03-25',
                description:'test',
                state:'未完成',
                userid:''
            },
            ScheduleRules:{
                event_type:[
                    {required:true, message: '请输入类型', trigger:'blur'},
                ],
                location:[
                    {required:true, message: '请输入地点', trigger:'blur'}
                ],
                start_time:[
                    {required:true, message: '请输入开始时间', trigger:'blur'}
                ],
                end_time:[
                    {required:true, message: '请输入结束时间', trigger:'blur'}
                ],
                description:[
                    {required:true, message: '请输入描述', trigger:'blur'}
                ]
            },
            select_date:'',
            addSchedule:false,
            editSchedule:false,
            user:{
                userid:''
            },
            schedule:{
                id:''
            },
            editScheduleid:'',
            ScheduleState:'',
            ScheduleStatelist:[
                {
                    value: '未完成',
                    label: '未完成',
                },
                {
                    value: '已完成',
                    label: '已完成',
                },
            ],
            okDeleteSchedules:false,
            selectUserRows:'',
            okViewChat:false,
            textarea:'123',
            UserList:{},
            chatForm:{}
        }
    },
    async created() {
        await this.getUserList()
        await this.getSchedulelist()
        // this.loading = false
    },
    methods: {
        //获取用户列表
        async getUserList(){
            this.loading = true
            const {data: res} = await this.$axios.get('/users',
            {
                
            })
            if(res.status !== 200) return  this.$message.error(res.msg)
            this.$message.success(res.msg)
            this.loading = false
            for(let i = 0; i < res.data.length; i++){
                this.UserList[res.data[i].userid]=res.data[i].username
            }
            console.log(this.UserList)
            console.log(res.data)
        },
        async getSchedulelist(){
            // this.loading = true
            // this.user.userid = sessionStorage.getItem('userid')
            // console.log(this.user)
            const {data: res} = await this.$axios.get('/chats',
            {
                // params: this.user,
            })
            // console.log(res)
            if(res.status !== 200) return  this.$message.error(res.msg)
            this.$message.success(res.msg)
            console.log(res.data)
            this.schedule_list = res.data
            
        },
        async getScheduleDate(){
            // console.log(this.select_date)
            let date = new Date(this.select_date);
            // 获取年、月、日、时、分和秒
            let year = date.getFullYear();
            let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份需要加1，然后补0
            let day = date.getDate().toString().padStart(2, '0'); // 日补0

            // 构建新的日期字符串
            let formattedDate = `${year}-${month}-${day}`;
            let data = {
                userid: sessionStorage.getItem('userid'),
                start_time: formattedDate
            }
            // console.log(this.user)
            const {data: res} = await this.$axios.get('/search',
            {
                params: data,
            })
            // console.log(res)
            if(res.status !== 200) return  this.$message.error(res.msg)
            this.$message.success(res.msg)
            this.schedule_list = res.data
        },
        ViewChat(message){
            this.okViewChat = true;
            this.textarea = message
            const jsonString = message

            const jsonArray = JSON.parse(jsonString);

            let conversation = '';

            jsonArray.forEach(item => {
                conversation += `${item.role}: ${unescape(item.content.replace(/\\u/g, "%u"))}\n`;
            });
            this.textarea = conversation
            console.log(conversation);

        },
        addScheduleList(){
            this.$refs.ScheduleRef.validate(async valid => {
                if(!valid) return 
                this.addSchedule = false
                // this.loading = true
                this.addScheduleForm.start_time=this.convertDate(this.addScheduleForm.start_time)
                this.addScheduleForm.end_time=this.convertDate(this.addScheduleForm.end_time)
                
                this.addScheduleForm.userid = sessionStorage.getItem('userid')
                // console.log(this.addScheduleForm)
                let data = this.$qs.stringify(this.addScheduleForm)
                const {data: res} = await this.$axios.post('/schedule',data,
                {
                    headers : {
                        'token': sessionStorage.getItem('token')
                    }
                })
                if(res.status ===200){
                    this.getSchedulelist()
                }else{
                    this.$message.error(res.msg);
                }
                // this.loading = false
            })
        },
        //软删除
        async deleteChat(id){
            let data = this.$qs.stringify(this.chatForm)
            const {data: res} = await this.$axios.post('/softdeletechats',data,
            {
                // params: this.schedule,
            })
            if(res.status ===200){
                this.realDeleteChat(id);
                this.getSchedulelist()
            }else{
                this.$message.error(res.msg);
            }
        },
        async realDeleteChat(id){
            // this.schedule.id = id
            // console.log(this.schedule)
            const {data: res} = await this.$axios.delete('/chat/'+id,
            {
                // params: this.schedule,
            })
            if(res.status ===200){
                this.getSchedulelist()
            }else{
                this.$message.error(res.msg);
            }
        },
        handleSelectionUserChange(row){
            this.selectUserRows = row
            // console.log(row[0].id)
        },
        //触发批量删除用户按钮
        DeleteSchedules(){
            console.log(this.selectUserRows.length)
            if(this.selectUserRows.length > 0){
                this.okDeleteSchedules = true;
            }
        },
        //确定批量删除多个用户
        ConfirmDeleteSchedules(){
            for(let i = 0; i < this.selectUserRows.length; i++){
                // console.log(this.selectUserRows[i])
                this.deleteChat(this.selectUserRows[i].id)
                // this.ConfirmDeleteUser()
            }
            this.getSchedulelist()
            this.okDeleteSchedules = false;
        },
        editScheduleList(){
            this.$refs.ScheduleRef.validate(async valid => {
                if(!valid) return 
                this.editSchedule = false
                this.addScheduleForm.start_time=this.convertDate(this.addScheduleForm.start_time)
                this.addScheduleForm.end_time=this.convertDate(this.addScheduleForm.end_time)
                this.addScheduleForm.state = this.ScheduleState
                console.log(this.editScheduleid)
                let data = this.$qs.stringify(this.addScheduleForm)
                const {data: res} = await this.$axios.put('/schedule/'+this.editScheduleid,data,
                {
                    // headers : {
                    //     'token': sessionStorage.getItem('token')
                    // }
                })
                if(res.status ===200){
                    this.getSchedulelist()
                }else{
                    this.$message.error(res.msg);
                }
                // this.loading = false
            })
        },
        convertDate(originalDate){
            let date = new Date(originalDate);
            // 获取年、月、日、时、分和秒
            let year = date.getFullYear();
            let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份需要加1，然后补0
            let day = date.getDate().toString().padStart(2, '0'); // 日补0
            let hours = date.getHours().toString().padStart(2, '0'); // 小时补0
            let minutes = date.getMinutes().toString().padStart(2, '0'); // 分钟补0
            // let seconds = date.getSeconds().toString().padStart(2, '0'); // 秒补0

            // 构建新的日期字符串
            let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
            return formattedDate
        },
        handleStateChange(){
            console.log(this.addScheduleForm)
        }
    }
};
</script>
<style>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.content {
  flex: 1; /* 占据剩余空间 */
}

.button-container {
  margin-right: 10px; /* 右边距 */
}
</style>