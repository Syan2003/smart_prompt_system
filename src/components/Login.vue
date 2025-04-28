<template>
  <div class="login-page">
    <div class="container">
      <!-- 左侧部分：登录 -->
      <div class="welcome-back">
        <h1>欢迎注册</h1>
        <!-- <p>注册开启专属你的精彩世界！</p> -->
        <el-button class="signin-btn" type="primary" @click="register">注册</el-button>
      </div>

      <!-- 右侧部分：注册 -->
      <div class="create-account">
        <h1>登录</h1>
        <!-- <el-input class="input-field" placeholder="Name"></el-input> -->
        <el-input class="input-field" v-model="userForm.username" placeholder="昵称"></el-input>
        <el-input class="input-field" v-model="userForm.password" placeholder="密码" show-password></el-input>
        <el-button class="signup-btn" type="primary" @click="login">登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ElButton, ElInput } from 'element-plus'
export default{
  data(){
      return {
          okadmin:1,
          admin:false,
          userForm:{
            username:'',
                password:''
          },
      }
  },
  created(){
      this.okadmin = sessionStorage.getItem('role')
      console.log(this.okadmin)
  },
  methods:{
      register(){
          this.$router.push('/register')
      },
      async login(){
          // if(this.userForm.username === "admin" && this.userForm.password === "123456"){
              // this.$router.push('/vue3-vite-screen')
          // }else alert("用户名错误或密码错误！")
          // this.$refs.userRef.validate(async valid => {
            // console.log(valid)
            console.log(this.userForm)
            // if(!valid) return 
            const {data: res} = await this.$axios.post('/login',this.userForm)
            console.log(res)
            if(res.code === 200){
                // if(ans.status !== 200) return  this.$message.error(ans.msg)
                // this.$message.success(ans.msg)
                // window.sessionStorage.setItem('task_id',ans.data[0].task_id)
                // window.sessionStorage.setItem('task_name',ans.data[0].task_name)
                this.$router.push('/card')
            }else{
                this.$message.error(res.msg);
            }
        // })
      },
      setCookie(name , value){
          const cookies = new Cookies();
              const options = {
              secure: true,
              sameSite: 'none',
              };
          cookies.set(name, value, options);
      },
      swap_admin(){
          this.$router.push('/admin')
      },
      handleSelect(val){
          if(val === "2-1") this.$i18n.locale = 'en'
          else this.$i18n.locale = 'zh'
      },
      activeIndex(){
          
      }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

/* .login-page {
  font-family: 'Montserrat', sans-serif;
  background-color: #f0f4f8;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: row;
  width: 800px;
  max-width: 100%;
  min-height: 400px;
  overflow: hidden;
}

.welcome-back, .create-account {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  width: 50%;
} */
.login-page {
  font-family: 'Montserrat', sans-serif;
  background: url('@/assets/login.png') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 
              0 10px 10px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: row;
  width: 40%;
  height: 40%;
  max-width: 100%;
  /* min-height: 400px; */
  overflow: hidden;
  backdrop-filter: blur(10px);
  position: absolute;
  right: 35%; 
  transform: translateX(50%); 
}

.welcome-back, .create-account {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  width: 50%;
}

.welcome-back {
  /* background-color: #f0f4f8; */
  background-color: rgba(240, 244, 248, 0.25); /* 添加透明度 */
  text-align: center;
}

.create-account {
  /* background-color: #fff; */
  background-color: rgba(255, 255, 255, 0.1);
  text-align: center;
}

h1 {
  font-weight: 700;
  margin: 0 0 20px;
}

p {
  font-weight: 400;
  font-size: 14px;
  color: #606f7b;
  margin-bottom: 30px;
}

.social-container {
  margin: 20px 0;
}

.social {
  border: 1px solid #dddddd;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;
  margin: 0 10px;
  color: #333;
  font-size: 18px;
  text-decoration: none;
}

span {
  font-size: 12px;
  color: #606f7b;
  margin-bottom: 20px;
}

.input-field {
  margin-bottom: 20px;
  width: 100%;
}

.el-input__inner {
  border-radius: 20px;
  padding: 10px 15px;
}

.signin-btn, .signup-btn {
  border-radius: 20px;
  padding: 10px 30px;
  font-size: 14px;
  background-color: #4cafef;
  color: white;
}

.signin-btn {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.signup-btn {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background-color: #4cafef;
}
</style>
