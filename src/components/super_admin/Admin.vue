<template>
  <el-container class="home-container">
    <el-header>
      <div>
          <span>基于大语言模型的个人工作助手</span>
      </div>
      <el-switch
        v-model="admin"
        class="ml-2"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        active-text="用户模式"
        inactive-text="管理员模式"
        @change="swap_admin"
      />
      <el-button type="primary" plain @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside width="200px">
          <el-menu
              active-text-color="#ffd04b"
              background-color="#545c64"
              class="el-menu-vertical-demo"
              default-active="2"
              text-color="#fff"
              :router="true"
          >
          <el-menu-item index="user">
              <span><el-icon><User /></el-icon>用户管理</span>
          </el-menu-item>
          <el-menu-item index="schedules">
              <span><el-icon><Compass /></el-icon>日程管理</span>
          </el-menu-item>
          <el-menu-item index="chats">
              <span><el-icon><Monitor /></el-icon>对话管理</span>
          </el-menu-item>
          <el-sub-menu index="1">
                <template #title>
                    <span><el-icon><Delete /></el-icon>回收站</span>
                </template>
                    <el-menu-item index="RecycleUsers">
                        <span><el-icon><User /></el-icon>用户回收</span>
                    </el-menu-item>
                    <el-menu-item index="RecycleSchedule">
                        <span><el-icon><Compass /></el-icon>日程回收</span>
                    </el-menu-item>
                    <el-menu-item index="RecycleChat">
                        <span><el-icon><Monitor /></el-icon>对话回收</span>
                    </el-menu-item>
                </el-sub-menu>
          </el-menu>
      </el-aside>
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>


<script>
import { Menu,Compass,User,Message,Delete,Monitor,ShoppingBag } from '@element-plus/icons-vue'
import Cookies from 'universal-cookie';

export default{
  components: { Menu,Compass,User,Message,Delete,Monitor,ShoppingBag },
  data() {
    return {
      admin:true
    }
  },
  methods:{
      logout(){
          window.sessionStorage.clear()
          this.$router.push('/login')
          this.setCookie("verify_authenticity_token", "")
      },
      setCookie(name , value){
          // var date= new Date(); 
          // date.setDate(date.getDate()+time); 
          // document.cookie = name + "=" + value + ";expires=" + date; 
          // console.log(document.cookie)
          const cookies = new Cookies();
              const options = {
              secure: true,
              sameSite: 'none',
              };
          cookies.set(name, value, options);
      },
      swap_admin(){
        this.$router.push('/home')
      }
  }
}

</script>
<style less="less" scoped>
.home-container{
  height: 100%;
}
.el-header{
  display: flex;
  background-color: #409EFF;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 20px;
}
.el-aside{
  background-color: #303133;

}
.el-main{
  background-color: #E4E7ED;
}

</style>