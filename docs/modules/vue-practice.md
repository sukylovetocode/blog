## 批量注册指令

```javascript
// directives/index
import copy from "./copy";
import longpress from "./longpress";
// 自定义指令
const directives = {
  copy,
  longpress,
};

export default {
  install(Vue) {
    Object.keys(directives).forEach((key) => {
      Vue.directive(key, directives[key]);
    });
  },
};

// main.js
import Vue from "vue";
import Directives from "./directives";
Vue.use(Directives);
```

## vue 中 axios 请求配置 token 过期和登录成功重新跳转

#### 后端

```javascript

// jwt.js
const jwt = require('jsonwebtoken')
const { SECRET_KEY, JWT_EXPIRES, REFRESH_JWT_EXPIRES } = require('../config/config') // 从配置文件中引入 SECRET_KEY，token 过期时间，refreshToken 过期时间
const { cacheUser } = require('../cache/user') // 用闭包缓存用户名

/**
 * 生成 token 和 initToken
 * @param {string} username
 */
function initToken (username) {
  return {
    token: jwt.sign({
      username: username
    }, SECRET_KEY, {
      expiresIn: JWT_EXPIRES
    }),
    refresh_token: jwt.sign({
      username
    }, SECRET_KEY, {
      expiresIn: REFRESH_JWT_EXPIRES
    })
  }
}

/**
 * 验证 token/refreshToken
 * @param {string} token 格式为 `Beare ${token}`
 */
function validateToken (token, type) {
  try {
    token = token.replace(/^Bearer /, '')
    const { username } = jwt.verify(token, SECRET_KEY)
    if (type !== 'refreshToken') {
      // 如果是 token 且 token 生效，缓存 token
      cacheUser.setUserName(username)
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  initToken,
  getTokenUser,
  validateToken
}

// 检查是否登录中间件方法
checkLogin (req, res, next) {
    const { headers: { authorization } } = req
    if (!authorization) {
      res.status(402).json({ code: 'ERROR', data: '未检测到登录信息' })
      return false
    }
    try {
      validateToken(authorization)
    } catch (e) {
      if (e.message === 'jwt expired') {
        // token 超时
        res.status(401).json({ code: 'ERROR', data: '登录超时' })
        return false
      } else {
        res.status(402).json({ code: 'ERROR', data: '未检测到登录信息' })
        return false
      }
    }
```

```javascript
// 添加请求拦截器，在请求头中加token
axios.interceptors.request.use(
  (config) => {
    let token = sessionStorage.getItem("Authorization");
    if (token) {
      // 设置到头部
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function(response) {
    return response;
  },
  async function(error) {
    // 1. 如果没有refresh_token,则直接跳转登录页
    if (error.response && error.response.status === 401) {
      const user = store.status.user;
      if (!user || !user.refresh_token) {
        redirectLogin();
        return;
      }
    }
    // 2.如果有，则请求更新token
    try {
      const { data } = await axios({
        method: "PUT",
        url: "http://ttapi.research.itcast.cn/app/v1_0/authorizations",
        headers: {
          Authorization: `Bearer ${user.refresh_token}`,
        },
      });
      // 3.如果刷新token成功了，则把新的token更新到容器中
      window.sessionStorage.setItem("Authorization", data);
      // 4.把之前失败的请求继续发出去
      return axios(error.config);
    } catch (error) {
      console.log("刷新token失败", err);
      redirectLogin();
    }

    return Promise.reject(error);
  }
);

function redirectLogin() {
  router.push({
    name: "/login",
    // query参数会以？key=value&key=value的格式添加到url后面
    // query参数不需要配置路由规则，可以传递任何参数
    // query是固定的语法给是，用来传递?key=value查询字符串
    query: {
      // 这里使用查询参数跳转回来的路由地址传递给了登录页面
      // router.currentRoute就是当前路由对象，好比我们再组件中的this.$route
      // 当前路由对象的fullPath,就是当前路由的路径
      // redirect是我起的一个名字
      redirect: router.currentRoute.fullPath,
    },
  });
}

const redirect = this.$router.query.redirect || "/";
this.router.push(redirect);
```
