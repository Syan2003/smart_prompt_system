<template>
    <div>
      <el-breadcrumb>
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-form ref="addUserRef" :rules="addUserRules" :model="PasswordList" label-width="80px" class="form_style">
            <el-form-item label="旧密码" prop="OldPassword">
                <el-col :span="20">
                    <el-input show-password v-model="PasswordList.OldPassword" placeholder="请输入密码"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="新密码" prop="NewPassword">
                <el-col :span="20">
                    <el-input show-password v-model="PasswordList.NewPassword" placeholder="请输入新密码"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="新密码" prop="TempPassword">
                <el-col :span="20">
                    <el-input show-password v-model="PasswordList.TempPassword" placeholder="请再次输入新密码"></el-input>
                </el-col>
            </el-form-item>
        </el-form>
        <el-button type="primary" @click="EditUser">
            确定
        </el-button>
      </el-card>
    <el-dialog
            v-model="okEditUser"
            width="30%"
            align-center
            title="温馨提示"
            >
            <span>你确定要更新密码吗？</span>
            <template #footer>
                <span class="dialog-footer">
                <el-button @click="okEditUser = false">取消</el-button>
                <el-button type="primary" @click="EditUserConfirm">
                    确定
                </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import { Search,Plus,Delete } from '@element-plus/icons-vue'
import { ref, computed } from 'vue';
export default{
    
    components: { Search,Plus,Delete },
    data(){
        return{
            UserList:[
                
              ],
              addUser:false,
              addUserForm:{
                username:'',
                password:'',
                role:0
              },
              addUserRules:{
                OldPassword:[
                    {required:true, message: '请输入密码', trigger:'blur'}
                ],
                NewPassword:[
                    {required:true, message: '请输入密码', trigger:'blur'}
                ],
                TempPassword:[
                    {required:true, message: '请输入密码', trigger:'blur'}
                ],
              },
              PasswordList:{
                OldPassword:'',
                NewPassword:'',
                TempPassword:''
              },
              EditUserID:'',
              okEditUser:false,
              okDeleteUser:false,
              UserID:'',
              selectUserRows:'',
              okDeleteUsers:false,

              loading: false,
        }
    },
    created(){
        // this.getUserList()
    //   this.getBookmark()
    },
    methods:{
        //获取用户列表
        async getUserList(){
            this.loading = true
            const {data: res} = await this.$axios.get('/users',
            {
            //   params: this.queryPage,
            //   headers : {
            //       'token': sessionStorage.getItem('token')
            //   }
            })
            if(res.status !== 200) return  this.$message.error(res.msg)
            this.$message.success(res.msg)
            this.UserList = res.data
            this.loading = false
            console.log(this.UserList)
            for(let i = 0; i < this.UserList.length; i++){
            if(this.UserList[i].role === 0){
                this.UserList[i].role = "普通用户"
            }else{
                this.UserList[i].role = "管理员"
            }
            }
            console.log(this.UserList)
        },
        //触发编辑用户按钮
        EditUser(){
                this.EditUserID = window.sessionStorage.getItem('userid');
                if(window.sessionStorage.getItem('password') !== this.PasswordList.OldPassword){
                    alert("旧密码错误！")
                    return 
                }
                if(this.PasswordList.TempPassword !== this.PasswordList.NewPassword){
                    alert("两次输入的新密码不一致！")
                    return 
                }
                this.okEditUser = true;
          },
          //确认编辑用户
          EditUserConfirm(){
            this.$refs.addUserRef.validate(async valid => {
                console.log(valid)
                if(!valid) return 
                this.okEditUser=false
                this.loading = true
                this.addUserForm.role = window.sessionStorage.getItem('role');
                this.addUserForm.username = window.sessionStorage.getItem('username');
                this.addUserForm.password = this.PasswordList.NewPassword
                let data = this.$qs.stringify(this.addUserForm)
                console.log(this.addUserForm)
                const {data: res} = await this.$axios.put('/user/'+this.EditUserID,data,
                {
                    // headers : {
                    //     'token': sessionStorage.getItem('token')
                    // }
                })
                if(res.status ===200){
                    this.getUserList()
                }else{
                    this.$message.error(res.msg);
                }
                this.loading = false
            })
          },
    }
}
</script>
<style>
.input-with-select .el-input-group__prepend {
background-color: var(--el-fill-color-blank);
}
.el-table{
    margin-top: 10px;
}
.el-pagination{
    margin-top: 10px;
}
</style>