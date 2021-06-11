## video 的那些事

video 的标准就是展现我们前端有多乱的乱世枭雄的最大体现。

### H5 视频固定大小播放

加入`playsinline`是微信固定尺寸的关键 而`webkit-playsinline`是 IOS 固定尺寸的关键

```javascript
<video playsinline webkit-playsinline />
```

### 视频自动播放

#### 各大平台对自动播放的表现

- Firefox / QQ 浏览器 / 钉钉 使用 video autoplay 的表现良好
- 移动端 Chrome
  - muted 可以自动静音播放
  - 引导用户做一次交互
  - MEI 值高的网站
- 移动端 Safari
  - muted 可以自动静音播放
  - 引导用户做一次交互
  - 引导用户对浏览器设置为【允许自动播放】
- 移动端 UC 浏览器
  - 引导用户做一次交互

### 如何解决

#### 微信端

需要用到`WeixinJSBridge`,需要对象准备好才能自动播放

```javascript
//监听 WeixinJSBridge 是否存在
if (
  typeof WeixinJSBridge == "object" &&
  typeof WeixinJSBridge.invoke == "function"
) {
  vedio.play();
} else {
  //监听客户端抛出事件"WeixinJSBridgeReady"
  if (document.addEventListener) {
    document.addEventListener(
      "WeixinJSBridgeReady",
      function() {
        vedio.play();
      },
      false
    );
  } else if (document.attachEvent) {
    document.attachEvent("WeixinJSBridgeReady", function() {
      vedio.play();
    });
    document.attachEvent("onWeixinJSBridgeReady", function() {
      vedio.play();
    });
  }
}
```

### 视频短暂黑屏

部分 android 机型点击播放视频时，会出现短暂 1~2s 的黑屏。该问题出现可能是还没请求完成可顺利播放的视频

解决方案：在视频上叠加一个 div，把它的背景图换成首帧图。监听 timeupdate 事件，有视频播放时移除该 div。

```html
<div @click="play">
  <video
    ref="video"
    :class="{'playing': playing}"
    :poster="startSource"
    x-webkit-airplay="allow"
    x5-video-player-type="h5"
    x5-playsinline
    webkit-playsinline
    playsinline
  >
    <source :src="videoSource" type="video/mp4" />
  </video>
  <div :class="['cover-start']" v-if="!playing"></div>
</div>
```

```javascript
this.videoNode.addEventListener(
  "timeupdate",
  () => {
    // 当视频的currentTime大于0.1时表示黑屏时间已过，已有视频画面，可以移除浮层
    if (this.videoNode.currentTime > 0.1 && !this.playing) {
      this.playing = true;
    }
  },
  false
);
```

### 部分 Android 机跳到 x5 player 播放视频

有些 android 在微信或浏览器，播放视频会跳到 x5 player 播放器中。这种 video 位于页面最顶层，无法被遮盖，说不定播完会推送腾讯视频信息，而且不会自动关掉。

解决方案：利用 timeupdate 事件，当视频快要结束时，手动 remove 掉整个视频。

```javascript
this.videoNode.addEventListener(
  "timeupdate",
  () => {
    // 兼容Android X5在浏览器行为.时间为视频时长
    if (this.videoNode.currentTime > 56.9) {
      this.isShowVideo = false;
    }
  },
  false
);
```

### 视频 canplay 的坑

换了引导用户的视频方案后，前面有个 loading 页面。产品希望视频加载好后，loading 消失并视频可点击。但是 ios 下 canplay 和 canplaythrough 事件都不会执行回调。ios 是点击播放后才会去加载视频流。android 下会执行 canplay 事件回调，但视频流也是边下边播。所以无法准确获得视频可加载时间点

总结：H5 现在视频标准不完善，除了 timeupdate、ended 事件外，其他事件慎用。
