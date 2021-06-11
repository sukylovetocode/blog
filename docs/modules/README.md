# 基础知识

## computed 自定义其中的 setter

```javascript
  computed:{
    fullName: {
      get:function(){
        return this.firstName
      },
      set:function(){
        //do sth
      }
    }
  }
```

上面的代码会使我们在调用`app.fullName = "xxx"`生效并自动调用`setter`方法，不过计算属性我们一般都只是用到他们的`getter`，所以我们使用他们的默认写法就行了。优点：依赖缓存

## 获取 data 属性

// html

```html
<span @click="getdata" :data-id="ids">待付款</span>
```

// VUE

```javascript
getdata:function(e){
console.log(e.srcElement.dataset.id)
}
```

## 渲染动态类名

```html
<!-- 带某个值需要判断 -->
<div :class="[{'active':isActive},'error']"></div>
<div :class="[isActive?'success':'error']"></div>
<!-- 带变量 -->
<div :class="[isActive? success:error]"></div>
<div :class="['option', activeOption === 'sit' ? '--is-active' : '']"></div>
```

::: warning
v-show 是在 CSS 中添加`dispay:none`达到的不显示，而 v-if 是真正的条件渲染；因此不经常改变的场景适合用 v-if 而经常切换条件的场景则适合用 v-show
:::

## 绑定内联样式

```html
<div :style="{'color':'#55632' }"></div>
```

::: warning
VUE 有可能会因为性能考虑而复用我们的组件，如果这时候想要我们的组件是不同的，可以选择给他们各自添加一个 key 值，添加后将不会当作相同组件而复用
:::

### 过滤器

通过添加过滤器我们的值将会被处理

```html
<div>{{date | formatDate}}</div>
```

```javascript
  filters:{
    formatDate:function(val){ // do sth}
  }
```

### vue 如何获得兄弟元素，子元素，父元素

```javascript
// e.target 是你当前点击的元素
// e.currentTarget 是你绑定事件的元素
//获得点击元素的前一个元素
e.currentTarget.previousElementSibling.innerHTML;
//获得点击元素的第一个子元素
e.currentTarget.firstElementChild;
// 获得点击元素的下一个元素
e.currentTarget.nextElementSibling;
// 获得点击元素中id为string的元素
e.currentTarget.getElementById("string");
// 获得点击元素的string属性
e.currentTarget.getAttributeNode("string");
// 获得点击元素的父级元素
e.currentTarget.parentElement;
// 获得点击元素的前一个元素的第一个子元素的HTML值
e.currentTarget.previousElementSibling.firstElementChild.innerHTML;
```

## 渲染纯 HTML

```html
<div v-pre>{{内容不被渲染}}</div>
```

## 不能检测到的数组变化

> **[!WARNING] For warning**
> filter、concat、slice 不会改变原数组，会返回新的数组

- 通过索引直接设置值`app.book[2] = 'xxx'`
- app.book.length = 1

上述的变化都不会让 VUE 检测到，我们可以采取以下办法

- 使用`Vue.set`
- 使用`splice`
- 进行深克隆（不推荐、性能消耗大）

## 事件

```html
<!-- 传入原生DOM事件 $event -->
<div @click="handleClick($event)"></div>
<!-- 阻止冒泡 -->
<div @click.stop="handler"></div>
<!-- 提交事件不重载页面 -->
<div @click.prevent="handler"></div>
<!-- 只在自己本身触发回调 -->
<div @click.self="handler"></div>
<!-- 只触发一次 -->
<div @click.once="handler"></div>

<!-- 按键13时触发 -->
<div @keyup.13="handler"></div>
```

## 输入框注意

```html
<input type="checkbox" :true-value="a" :false-value="b" v-model="toggle" />
<!-- 当选中时
vm.toggle === vm.a
  当没有选中时
vm.toggle === vm.b -->

<!-- 去除首尾空格 -->
<input type="checkbox" v-model.trim="toggle" />
<!-- 失焦或者回车时更新 -->
<input type="checkbox" v-model.lazy="toggle" />
<!-- 数字输入框  -->
<input type="checkbox" v-model.number="toggle" />
```

## 组件通信

### 父子组件通信

```javascript
// 发给父组件
this.$emit("xxx");
```

```html
<!-- 监听 -->
<div @xxx="handler"></div>
```

### 非父子组件通信

### BUS

```javascript
// 组建BUS实例
var bus = new Vue();
bus.$on("xxx");
bus.$emit("xxx");
```

### 父链

```javascript
this.$parent.message = "api";
```

### 子组件索引

```javascript
this.$refs.comp.data; // 通过实例中组件得到数据
```

# 组件

### 动态组件

```xml
  <component :is="view"></component>
```

### 异步组件

```javascript
Vue.component("child", function(resolve, reject) {
  window.setTimeout(function() {
    resolve({
      template: "<div>xxx</div>",
    });
  }, 2000);
});
```

### 手动挂载实例

```javascript
Vue.extend(component);

new component().$mount("selector ");
```

### 函数化组件

函数化组件中的 this 都是由 context 提供，比如 context.data,context.props 等

```javascript
Vue.component("component", {
  functional: true,
  render: function(createElement, context) {
    // do sth
  },
});
```

### render 函数

有时候我们想要定制些简单的组件如果还是用我们平时的插槽就会发生以下状况

```javascript
<script type="text/x-template" id="anchored-heading-template">
  <h1 v-if="level === 1">
    <slot></slot>
  </h1>
  <h2 v-else-if="level === 2">
    <slot></slot>
  </h2>
  <h3 v-else-if="level === 3">
    <slot></slot>
  </h3>
  <h4 v-else-if="level === 4">
    <slot></slot>
  </h4>
  <h5 v-else-if="level === 5">
    <slot></slot>
  </h5>
  <h6 v-else-if="level === 6">
    <slot></slot>
  </h6>
</script>;
Vue.component("anchored-heading", {
  template: "#anchored-heading-template",
  props: {
    level: {
      type: Number,
      required: true,
    },
  },
});
```

以上简直是灾难现场有没有，这时候我们使用 render 函数就能很好的克服这个问题，又变成清爽的组件

```javascript
Vue.component("anchored-heading", {
  render: function(createElement) {
    return createElement(
      "h" + this.level, // 标签名称
      this.$slots.default // 子节点数组
    );
  },
  props: {
    level: {
      type: Number,
      required: true,
    },
  },
});
```

假如再配合 JSX 那是更加棒棒哒,偏逻辑的可以考虑使用 JSX，而偏视图的可以使用 template
`npm install @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props`

配置`.babelrc`

```
{
    "presets": ["@vue/babel-preset-jsx"]
}
```

# 如何开发一个插件

### 保证你的插件暴露一个 install 方法

```javascript
yourPlugin.install = function(Vue, options) {
  // 安装过就忽略
  if (install.installed) return;
  // 1. 添加全局方法或属性
  Vue.myGlobalMethod = function() {};
  // 2. 添加全局资源
  Vue.directive("my-directive", {});
  // 3. 添加实例方法
  Vue.prototype.$myMethod = function() {};
  // 4. 添加全局混合
  Vue.mixin({});
  // 注册组件
  Vue.component(Page.name, Page);
};
```

所有的组件在`Vue.use(yourPlugin)`时会自动调用`install`办法

### 多个组件注册

```javascript
import Button from "./button/index.js"; // 引入组件
const components = [Button];
//'vue-use是调用的install方法'
const install = function(Vue) {
  if (install.installed) return;
  components.map((component) => Vue.component(component.name, component));
};
```

### 多个基础组件引入

VUE 给了他的解决方案,其实类似于组件注册

```javascript
import Vue from "vue";

// https://webpack.js.org/guides/dependency-management/#require-context
const requireComponent = require.context(
  // Look for files in the current directory
  ".",
  // Do not look in subdirectories
  false,
  // Only include "_base-" prefixed .vue files
  /_base-[\w-]+\.vue$/
);

// For each matching file name...
requireComponent.keys().forEach((fileName) => {
  // Get the component config
  const componentConfig = requireComponent(fileName);
  // Get the PascalCase version of the component name
  const componentName = fileName
    // Remove the "./_" from the beginning
    .replace(/^\.\/_/, "")
    // Remove the file extension from the end
    .replace(/\.\w+$/, "")
    // Split up kebabs
    .split("-")
    // Upper case
    .map((kebab) => kebab.charAt(0).toUpperCase() + kebab.slice(1))
    // Concatenated
    .join("");

  // Globally register the component
  Vue.component(componentName, componentConfig.default || componentConfig);
});
```

# mixins

用于继承，比如我们有些组件可能仅仅只是 UI 上有差距，而逻辑上是一样的，这时候采用 mixins 进行继承将会给我们带来很大的便利,本质是对象合并

```javascript
const toggleMixin = {
  data() {
    return {
      isShowing: false,
    };
  },
  methods: {
    toggleShow() {
      this.isShowing = !this.isShowing;
    },
  },
};

const Modal = {
  template: "#modal",
  mixins: [toggleMixin],
};

const Tooltip = {
  template: "#tooltip",
  mixins: [toggleMixin],
};
```

# 配 Mock 数据

### 配置假数据

```javascript
function mockData(method) {
  return res;
}
module.exports = chart;
```

### 在`vue.config.js`中进行配置

```javascript
   devServer: {
       proxy: {
           "/api": {
               target: "http://localhost:3000",
               bypass: function(req, res){
                   if(req.headers.accept.indexOf("html") !== -1){
                       return "index.html";
                   }else{
                       const name = req.path.split("/api/")[1].split("/").join("_");
                       const mock = require(`./mock/${name}`)
                       const result = mock(req.method)
                       // 删除缓存，不然更新mock文件不能正常获取新的数据
                       delete require.cache[require.resolve(`./mock/${name}`)];
                       return res.send(result)
                   }
               }
           }
       }
   }
```

# 配服务端数据

### 下载`cross-env`插件

这个插件能够帮助我们进行跨平台设置环境变量

### 设置我们所需的环境变量

```json
"scripts": {
   "serve": "vue-cli-service serve",
   "serve:no-mock": "cross-env MOCK=NO_MOCK vue-cli-service serve"
   "build": "vue-cli-service build",
   "lint": "vue-cli-service lint"
 },
```

### 检测当不是 MOCK 环境时才进行配置

```javascript
  devServer: {
      proxy: {
          "/api": {
              target: "http://localhost:3000",
              bypass: function(req, res){
                  if(req.headers.accept.indexOf("html") !== -1){
                      return "index.html";
                  }
                  if(process.env.MOCK === "NO_MOCK"){
                      详细配置
                  }
              }
          }
      }
  }
```

# provide/inject

常用在高阶插件及组件库中，允许一个祖先组件向其所有子孙注入一个依赖，能帮助我们优雅的获取跨层级组件实例（通过自定义 setChildrenRef 以及 getChildRef 通知以及获取）

> [!NOTE]
> provide 和 inject 的绑定不是可响应的，只有我们传入了可响应的对象时，其对象才可以响应

```javascript
// 父级组件提供 'foo'
var Provider = {
  provide: {
    foo: "bar",
  },
  // ...
};

// 子组件注入 'foo'
var Child = {
  inject: ["foo"],
  created() {
    console.log(this.foo); // => "bar"
  },
  // ...
};
```

### 自定义指令

```javascript
  // 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  },
  // 指令第一次绑到元素时调用
  bind:function(){}，
  // 被绑定元素模板更新时调用
  update:function(){},
  // 被绑定元素所在模板完成一次更新周期时
  componentUpdated:function(){},
  // 解绑
  unbind:function(){}
})
```

# 配置高扩展性的路由

```javascript
routes: [
  {
    path: "/user",
    name: "Login",
    // 按需加载并且可以根据我们设定的webpackChunkName来具体分要打包在那个包中
    component: () => import(/* webpackChunkName: "user" */ "./views/About.vue"),
  },
  {
    path: "/user",
    name: "Login",
    // 可以加载一个layout组件，如果不需要 { render: h=> h('router-view')},但是需要配置子节点的东西才能正常显示
    component: Layout,
    children: [
      {
        path: "/componentA",
        name: "ComponentA",
        component: () =>
          import(/* webpackChunkName: "user" */ "./views/componentA.vue"),
      },
    ],
  },
  {
    path: "*",
    name: "404",
    component: NotFound,
  },
];
```

### 添加进度条

`npm i nprogress`

```javascript
import Nprogress from "nprogress";
import "nprogress/nprogress.css";

router.beforeEach((to, form, next) => {
  if (to.path !== from.path) {
    Nprogress.start();
  }
  next();
});

router.afterEach(() => {
  Nprogress.done();
});
```

### 可改变的页面布局

将改变的值放在路由上，通过 computed 属性进行读取

### 菜单与路由结合

```javascript
  this.$router.options.routes 获得全部路由
  routes: [
    {
      path: '/user',
      name: 'Login',
      hideInMenu: true,
      // 按需加载并且可以根据我们设定的webpackChunkName来具体分要打包在那个包中
      component: () => import(/* webpackChunkName: "user" */"./views/About.vue")
    },
    {
       path: '/user',
       name: 'Login',
        // 可以加载一个layout组件，如果不需要 { render: h=> h('router-view')},但是需要配置子节点的东西才能正常显示
       component: Layout ,
       meta:{
         icon:"dashboard",
         title: "表单",
       },
       hideChildrenMenu: true,
       children:[
        {
              path: '/componentA',
              name: 'ComponentA',
              component: () => import(/* webpackChunkName: "user" */"./views/componentA.vue")
        },
      ]
    },
    {
      path: '*',
      name: '404',
      component: NotFound
    }
  ]
```

```javascript
getMenuData(routes = []){
  const menuData = []
  routes.forEach(item => {
    if(item.name && !item.hideInMenu){
      const newItem = { ... item }
      delete newItem.children; // 删除重新赋值
      // 处理子元素
      if(item.children && !item.hideChildrenInMenu){
        newItem.children = this.getMenuData(item.children)
      }else{
        this.getMenuData(item.children)
      }
      menuData.push(newItem)
    }else if(!item.hideInMenu && !item.hideChildrenInMenu && item.children){
      menuData.push(...this.getMenuData(item.children))
    }
  })
  return menuData
}
```

### 引入 ECharts

因为引入库的时候我们的页面有可能未渲染完，因此需要我们监听容器大小，当其改变时，我们需要重新渲染(也可通过延时渲染实现，但有机率渲染失败)

```html
<div ref="chartDOM></div>
```

```javascript
  import echarts from 'echarts'
  import { addListener, removeListener } from 'resize-detector'

  mounted(){
    this.myChart = echarts.init(this.$refs.chartDOM)
    addListener(this.$refs.chartDOM, this.reseize)
    this.myChart.setOption({...})
  },
  beforeDestroy(){
    // 移除监听、释放实例，防止内存泄漏
    removeListener(this.$refs.chartDom, this.resize)
    this.myChart.dispose()
    this.myChart = null
  },
  methods:{
    reseize(){
      this.myChart.reseize()
    }
  },
  created(){
    // 直接这样调用会使我们在缩放时调用多次，因此要添加防抖事件来避免
    this.reseize = debounce(this.resize, 300)
  }
```

### 深度监听数据

一个对象内部的对象某个值改变，是不会引起我们 VUE 实例更新的

```javascript
  watch: {
    option: {
      handler(val){
        this.myChart.setOption(val)
      },
      deep: true
    }
  }
```

或者手动赋予新值，触发更新

```javascript
  watch: {
    option: {
      this.myChart.setOption(val)
  }

  mounted(){
    this.options = {...this.options}
  }
```

### 管理系统中的图标

```javascript
// vue.config.js
  chainWebpack:config => {
    coonst svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule.use('vue-svg-loader').loader('vue-svg-loader') // 安装vue-svg-loader
  }

// 图标
<Logo /> // 直接使用
import Logo from '@/assets/logo.svg'
```

### 直接导出我们项目中 webpack 配置

```javascript
vue inspect output.js
```

### 实现国际化

`import VueI18n from 'vue-i18n`

新建 locale 文件夹，

```javascript
// zhCN.js
export default {
  "app.dashboard.analysis.timeLabel": "时间",
};

Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: queryString.parse(location.search).locale || "zhCN", // 需要下载queryString包
  messages: {
    zhCN: { message: zhCN },
    enUS: { message: enUS },
  },
});

// usage
{
  {
    $t("message")["app.dashboard.analysis.timeLabel"];
  }
}

// 切换语言
this.$i18n.locale = key;
```

### 可交互组件文档

就像组件网站那样能够直接加载我们的代码(还可以自己搞个组件专门加载)
`npm install raw-loader vue-highlightjs highlightjs`

```javascript
import chartCode from "!!raw-loader!../../components/Chart";
import "highlight.js/styles/github.css";

<pre v-highlightjs="chartCode">
  <code class="html"></code>
</pre>;
```

### 无用的静态数据

`Object.freeze()`可以冻结一个对象，使得我们冻结的对象不再被修改，也可以用来固定我们静态数据

```javascript
  data{
    // 无需监听动态变化的值，VUE将不会监听其变化，适合我们写入一下固定的值
    this.data2 = '222'
    return {
      data1:'xxx'
    }
  }
```

### nextTick

在 Vue 生命周期的`created()`钩子函数进行的 DOM 操作一定要放在`Vue.nextTick()`的回调函数中,因为`created()`执行时 DOM 还没有渲染，所以需要放在其中延迟执行,他会尝试用 Promise.then 以及 MutationObserver 来执行，但是如果都不支持则会使用最原始的`setTimeout`，因此这可能是微任务也可能是宏任务

```javascript
this.$nextTick(() => {
  //do sth
});
```

### 配置代码样式

`.eslintrc.js`

```
module.exports = {
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 5,
        "sourceType": "module"
    },
    "rules": {
    }
};
```

`.prettierrc.js`

```javascript
module.exports = {
  extends: ["airbnb", "prettier", "prettier/react"],
  singleQuote: true, // 使用单引号
  printWidth: 200, // 超过最大值换行
  htmlWhitespaceSensitivity: "ignore",
  semi: false, // 结尾不用分号
  disableLanguages: ["vue"], // 不格式化vue文件，vue文件的格式化单独设置
  trailingComma: "es6", // 函数最后不需要逗号
};
```

### VUEX 中的 modules

```javascript
const moduleA = {
  state: {},
  mutations: {},
  actions: {},
  getters: {},
};
const moduleB = {
  state: {},
  mutations: {},
  actions: {},
  getters: {},
};
const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB,
  },
});
store.state.a; //moduleA的状态
```

nrm 下载源切换
vue test utils jest mocha sinon
vue 的单元测试

CI 持续集成
https://travis-ci.org/
https://circleci.com/

单测覆盖率
https://codecov.io/
https://coveralls.io/

美化插件
@vue/prettier
