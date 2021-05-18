# 前端页面 SEO

## ❗ SEO 注意

#### 合理的 title description keywords

搜索对着三项的权重逐个减小，title 值强调重点即可；description 把页面内容高度概括，不可过分堆砌关键词；keywords 列举出重要关键词

```html
<title>网站标题</title>

<meta name="”Description”" content="”你网页的简述”" />

<meta name="”Keywords”" content="”关键词1,关键词2,关键词3,关键词4″" />
```

#### 语义化 HTML 代码，让搜索引擎更容易理解网页

- 尽可能少的使用无语义的标签 div 和 span
- 在语义不明显时，既可以使用 div 或者 p 时，尽量用 p, 因为 p 在默认情况下有上下间距，对兼容特殊终端有利
- 不要使用纯样式标签，如：b、font、u 等，改用 css 设置

#### 非装饰性图片必须加 alt

- 增强内容相关性
  它是可以利用汉字介绍文章内容的，对于一些特定的企业产品，由于视觉的体验，它往往是少文字的。
- 提高关键词密度
  在操作企业站的时候，我们经常遇到是站点首屏一个大的横幅 banner，几乎占用了首页的大部分页面，为了有效的提高首页核心关键词密度，我们只能利用一切办法增添关键词，比如：在图片的 alt 标签中添加

#### 友情链接及外链

提高网站权重

#### 想被抓取的内容不能写在 iframe 、js 上

搜索引擎不会抓取 iframe 中的内容,也不会执行 js

#### 百度特色

百度抓取的图片是我们`img`标签中大于 200\*200 的第一张，因此我们要注意要有特定的图片是要让该图片作为第一张进行渲染

## ❗ SSR 服务端渲染

`NUXT.js`就是为了 SSR 渲染而生的框架（这里就不说如何使用），它的作用在于我们使用`vue`构建的每个页面都能够直接访问时使用，比如企业官网，如果仅仅只是为了某几个营销页面的 SEO 而采取服务端渲染则是不明智的，我们应该使用下面的预渲染的方式

## ❗ 最近流行的浏览器 SPA 方法- 预渲染

之前 SPA 页面出来后，因为 SEO 的不友好，又使得很多人要去进行 SSR 的学习，但是如果服务端毕竟不是客户端，会导致很多乱七八糟的问题，这时候又有人提出来，能不能像爬虫一样，我们开启一个无头浏览器然后渲染页面？ 那答案是肯定的

### 使用：

在`vue.config.js` 中配置（针对@vue-cli 生成的页面）

```jsx
const path = require("path");
const PrerenderSPAPlugin = require("prerender-spa-plugin");
// PuppeteerRenderer是这个插件自带的无头浏览器插件 但我们也是可以更换其他渲染器
// 比如JSDOMRenderer 但是需要安装@prerenderer/renderer-jsdom
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

module.exports = {
  configureWebpack(config) {
    if (process.env.NODE_ENV === "production") {
      // vue-cli中插入插件的方式
      config.plugins.push(
        new PrerenderSPAPlugin({
          // 输出的路径
          staticDir: path.join(__dirname, "dist"),
          // 需要提前渲染的页面
          routes: ["/", "/about"],
          // 需要设置预渲染触发事件名称 使用渲染器
          renderer: new Renderer({
            renderAfterDocumentEvent: "render-event",
          }),
          // 预处理
          postProcess(renderedRoute) {
            // 忽略所有的重定向
            renderedRoute.route = renderedRoute.originalRoute;
          },
          // 压缩html选项
          minify: {
            collapseBooleanAttributes: true,
          },
        })
      );
    }
  },
};
```

在我们需要预渲染触发的实例 如 `main.js`

```jsx
new Vue({
  // ...
  mounted() {
    document.dispatchEvent(new Event("render-event"));
  },
}).$mount("#app");
```
