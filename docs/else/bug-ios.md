# IOS 经历过的 BUG

## Javascript 解决音频 audio 在 IOS 系统下无法播放问题

先调用一次 xxx.play(),在马上暂停 xxx.pause()

```javascript
audio.play();
setTimeout(function() {
  audio.pause();
}, 20);
```

## IOS 浏览器@keyframes 显示动画与其他浏览器不一致

一条线的高度从 0 到 1.19rem，但是打开页面第一次高度经过 0.5 秒并没有到 1.19rem，就是显示了一点长度就停止了，过了 0.5 秒以后会继续执行其他的动画.
首次加载页面时 IOS 计算 rem 单位的时候有问题，切换组件隐藏显示再加载动画的时候能正常显示，是因为此时计算 rem 已经正确了。所以延迟加载首页动画，等页面计算好 rem 单位后再加载动画就不会出现显示问题了。

```javascript
//延迟到JS中加载
setTimeout(() => {
  $(".scen_processLine1").addClass("animation");
}, 20);
```
