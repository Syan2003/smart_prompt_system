import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue'
// import test from '../components/test.vue'
import Home from '../components/Home.vue'
import Register from '../components/Register.vue'
import Admin from '../components/super_admin/Admin.vue'
import Welcome from '../components/Welcome.vue'
import UserCenter from '../components/user/user.vue'
// import User from '../components/super_admin/userlist.vue'
// import Schedules from '../components/super_admin/schedulelist.vue'
// import Chats from '../components/super_admin/chatlist.vue'
import Card from '../components/card.vue'
import Knowledge from '../components/knowledge.vue'
import Doc from '../components/doc.vue'
import Setting from '../components/setting.vue'
import Test from '../components/test/test.vue'
import Tmp from '../components/test/tmp.vue'
import Test1 from '../components/test/test1.vue'

const routes = [
    { 
        path: '/',
        component: Login,
        hidden: true
    },
    { 
        path: '/login',
        component: Login,
        hidden: true
    },
    { 
        path: '/test',
        component: Test,
        hidden: true
    },
    { 
        path: '/tmp',
        component: Tmp,
        hidden: true
    },
    { 
        path: '/test1',
        component: Test1,
        hidden: true
    },
    { 
        path: '/home',
        component: Home,
        hidden: true,
        redirect: '/card',
        children:[
            {path: '/card', component: Card },
            {path: '/knowledge', component: Knowledge },
            {path: '/doc', component: Doc },
            {path: '/setting', component: Setting },
            // {path: '/schedule', component: Schedule },
            // {path: '/chat', component: Chat },
            {path: '/UserCenter', component: UserCenter },
        ]
    },
    { 
        path: '/register',
        component: Register,
        hidden: true
    },
    { 
        path: '/welcome',
        component: Welcome,
        hidden: true
    },
    // { 
    //     path: '/admin',
    //     component: Admin,
    //     hidden: true,
    //     redirect: '/user',
    //     children:[
    //         {path: '/user', component: User },
    //         {path: '/schedules', component: Schedules },
    //         {path: '/chats', component: Chats },
    //     ]
    // },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

router.beforeEach((to, from, next) => {
    // if(to.path === '/login'|| to.path === '/home' || to.path === '/register' || to.path === '/activate' || to.path === '/activate_success' || to.path === '/select_monitor'|| to.path === '/pause_monitor') return next()
    // const tokenStr = window.sessionStorage.getItem('token')
    // if(!tokenStr) return next('/login')
    next()
})
