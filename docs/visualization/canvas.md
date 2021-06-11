# CANVAS 的入门使用

## 简单使用

canvas 本质来说就是一块画布，我们可以在其中进行各种图形的操作，而我们最常用的就是用来绘制动画，因为他的频繁刷新并不会导致 DOM 节点的改变，也因此不会导致页面的不断重排重绘，实在是动画的好帮手。

```javascript
// 获取画布
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
// 画图
ctx.drawImage(cacheCanvas, 0, 0, canvas.width, canvas.height);

// 画图形
ctx.fillStyle = "#ebebeb";
ctx.fillRect(0, 0, cacheCanvas.width, cacheCanvas.height);

// 写字
ctx.fillText("your text", 20, 30);

// 清除画布
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

这边我总结了一下我们常用 Canvas 大概就做几件事：

- 游戏开发
- 绘制截图
- 进行视频绘制
- 数据报表绘制

## 游戏开发

- ctx.drawImage 的显示 `ctx.drawImage(pic, sX, sY, sWid, sHei, dX, dY, dWid, dHei)`

```javascript
// 框架
// JAVASCRIPT CODE //
/* 全局变量 */
const canvas = document.getElementById('mycanvas')
const ctx = canvas.getContext("2d")
let frames = 0 /** 跟踪游戏绘制帧数 */
const DEGREE = Math.PI / 180 // 一角度是多少PI

/** 加载图片资源 */
const sprite = new Image()
sprite.src = 'img/sprite.png'

/** 加载声音文件 */
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

/** 定义背景 */
const bg = {}

/** 定义前景 */
const fg = {}

/** 定义小鸟 */
const bird = {
    animation: [
        {sX: 276, sY: 112},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139},
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    frame: 0,
    speed: 0,
    gravity: 0.3,
    jump: 4.6,
    rotation: 0,
    radius: 12, // 用于碰撞检测
    draw: function(){},
    flap: function(){}, // 点击事件
    update: function(){}, // 更新事件
    speedReset: function(){} // 回置
}

// 字面量进行保存
/** 定义管道 */
const pipes = {}

/** 计算得分 */
const score = {}

/** GET READY */
const getReady = {}

/** GAME OVER */
const gameOver = {}

/** 游戏状态 */
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    gameOver: 2
}

const startBtn = {}

/* 画布点击事件 */
canvas.addEventListener('click',function(event){
})
/* 绘图逻辑 */
function draw(){
    /** 绘制与现存的canvas 容器等大的矩形 */
    ctx.fillStyle = '#70c5ce'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    /** 绘制图像 */
    bg.draw()
    ...
}

/** 更新逻辑 */
function update(){
    fg.update()
    ...
}

/* 循环逻辑
   更新本质: 更新各个物品的坐标
*/
function loop(){
    update()
    draw()

    frames++

    requestAnimationFrame(loop)
}

loop()
```

### 检测资源加载进度

我们对检测资源加载进度这件事通常认为，当我们静态资源加载完，这个网页就真的加载完了，因此我们检测网页加载进度就是检测静态资源加载进度。
但如果在一般网页中，因为我们还会有大量图片是使用`background-image`引用的，就不适合通过检测静态资源加载进度来显示加载进度，而会直接采取`addEventListener('load')`配合 loading 动画来显示

```javascript
/** 加载资源 */
let resources = [
  {
    name: "sprite",
    src: "img/sprite.png",
  },
  {
    name: "SCORE_S",
    src: "audio/sfx_point.wav",
  },
  {
    name: "FLAP",
    src: "audio/sfx_flap.wav",
  },
  {
    name: "HIT",
    src: "audio/sfx_hit.wav",
  },
  {
    name: "SWOOSHING",
    src: "audio/sfx_swooshing.wav",
  },
  {
    name: "DIE",
    src: "audio/sfx_die.wav",
  },
];

/** 加载图片 */
function loadImages(images) {
  let len = images.length;
  let current = 0;
  let obj = {};
  for (let i = 0; i < len; i++) {
    obj[images[i].name] = new Image();
    obj[images[i].name].src = images[i].src;
    obj[images[i].name].onload = function() {
      current += 1;
      if (current === len) {
        resources = {};
        resources = Object.assign({}, obj);
        document.dispatchEvent(new Event("startLoadAudio"));
      }
      console.log(current, len);
    };
  }
}

/** 加载音乐 */
function loadAudio(audio) {
  let len = audio.length;
  let current = 0;
  let obj = {};
  for (let i = 0; i < len; i++) {
    // 音频文件
    obj[audio[i].name] = new Audio();
    obj[audio[i].name].src = audio[i].src;
    audio.load();
    obj[audio[i].name].addEventListener("canplay", function() {
      current += 1;
      if (current === len) {
        resources = Object.assign({}, resources, obj);
        document.dispatchEvent(new Event("audioLoadFinished"));
      }
      console.log(current, len);
    });
  }
}

function loadResources() {
  let images = resources.filter(
    (item) => item.src.indexOf("png") !== -1 || item.src.indexOf("jpg") !== -1
  );
  let audio = resources.filter(
    (item) => item.src.indexOf("wav") !== -1 || item.src.indexOf("mp3") !== -1
  );
  console.log(images, audio);
  loadImages(images);
  document.addEventListener("startLoadAudio", function() {
    console.log(resources);
    loadAudio(audio);
  });
  document.addEventListener("audioLoadFinished", function() {
    console.log(resources);
    /** game start */
    loop();
  });
}

loadResources();
```

### 游戏状态维护

canvas 是无法检测某些物品是否要绘制，因此如果我们有几个不同的场景进行切换时，需要通过 state 来进行状态维护

```javascript
const state = {
  current: 0,
  getReady: 0,
  game: 1,
  gameOver: 2,
};
```

### 游戏角色动起来

动画我们一般分为两种，一种是状态动画，通过改变他的 css 属性来达成，另一种是帧动画，通过不断更换图片达成视觉暂留效果,那作为游戏角色通常都是使用帧动画,因为 canvas 的更新速度为 60 帧每秒，如果根据 canvas 更新速度来更新动画，我们肉眼很可能察觉不出动画变化，所以我们会设置一个变量`frames`来控制更换速度。

```javascript
animation: [
  { sX: 276, sY: 112 },
  { sX: 276, sY: 139 },
  { sX: 276, sY: 164 },
  { sX: 276, sY: 139 },
],
  // 每更新5帧动画更新一次
  (this.frame += frames % this.period === 0 ? 1 : 0);
this.frame = this.frame % this.animation.length;

let bird = this.animation[this.frame];

ctx.drawImage(
  sprite,
  bird.sX,
  bird.sY,
  this.w,
  this.h,
  -this.w / 2,
  -this.h / 2,
  this.w,
  this.h
);
```

### 想要物品旋转

canvas 中物品旋转的话会使整个画布都旋转起来，因此我们会将要旋转的东西放在最后渲染，并且要通过`ctx.save`和`ctx.restore`来储存和恢复未旋转前的画布状态

```javascript
// old state
ctx.save();
// 让小鸟能够旋转
ctx.translate(this.x, this.y);
ctx.rotate(this.rotation);
// 减去的是为了让小鸟停在中心
ctx.drawImage(
  sprite,
  bird.sX,
  bird.sY,
  this.w,
  this.h,
  -this.w / 2,
  -this.h / 2,
  this.w,
  this.h
);
// back to old state
ctx.restore();
```

### 在某块位置发生点击事件

因为 canvas 只能绑定一个 DOM 事件，所以对于不同场景，某些位置的点击事件只能通过判断解决

```javascript
canvas.addEventListener("click", function(event) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      SWOOSHING.play();
      break;
    case state.game:
      bird.flap();
      FLAP.play();
      break;
    case state.gameOver:
      let rect = canvas.getBoundingClientRect();
      let clickX = event.clientX - rect.left;
      let clickY = event.clientY - rect.top;

      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        pipes.reset();
        bird.speedReset();
        score.reset();
        state.current = state.getReady;
      }
      break;
  }
});
```

### 音乐重复播放

```javascript
const SOUND_BG = new Audio();
SOUND_BG.src =
  "https://founq.oss-cn-shanghai.aliyuncs.com/video/yanghouziH5/peach%20beijing";
SOUND_BG.addEventListener(
  "ended",
  function() {
    this.currentTime = 0;
    this.play();
  },
  false
);
```

#### 设置画布规定大小

```javascript
PickPeach.canvas = document.getElementById("pickPeach");
PickPeach.canvas.style.width = "6.4rem";
PickPeach.canvas.style.height = "12.5rem";
```

#### 数组的变动导致屏幕的闪屏

```javascript
function game() {
  /* 物品更新 */
  arr.map((item, index) => {
    if (!item.isLive && item.needToClear) {
      arr.splice(index, 1);
    }
  });

  /* 更新我们的canvas */
  window.requestAnimFrame(game);
}
```

如上这段代码咋看并没有什么问题，就是一个数组，我们希望满足一定条件时能够删除，但是在实际运行的时候页面就会出现以下的情况。
![](/images/闪屏.gif)
就有很明显的卡一下的痕迹（图不是很明显），后来检测发现主要是页面不断在更新，而数组的处理是需要一点时间，这样的冲突下就会导致页面卡一下，只要我们在页面内设置定时，每隔一段时间在进行处理，这个问题就可以解决

### 双缓存解决绘制时间较长的问题

```javascript
function game() {
  // 更新时缓存画布直接复制过去
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(cacheCanvas, 0, 0, canvas.width, canvas.height);

  // 东西绘制在缓存canvas
  cacheCtx.fillStyle = "#ebebeb";
  cacheCtx.fillRect(0, 0, cacheCanvas.width, cacheCanvas.height);
  /* 更新我们的canvas */
  window.requestAnimFrame(game);
}
```

链接参考:
[使用双缓存解决 Canvas clearRect 引起的闪屏问题](https://juejin.im/post/6844903832439242766)
[【H5 动画】谈谈 canvas 动画的闪烁问题](https://www.cnblogs.com/kenkofox/p/4950727.html)
[Create The Original Flappy Bird Game Using JavaScript and HTML5 canvas](https://www.youtube.com/watch?v=0ArCFchlTq4&t=17s)

## 截图

最常用就是营销活动中用来进行用户二维码截图，这样我们后端就不需要在服务器中保存无数张用户截图，我们前端也不需要等待许久才能得到这一张图。

借助插件

- html2canvas.js
- canvas2img.js
- qrcode.min.js

```javascript
// 检测图片是否已经生成
function noCanvas(dom) {
  var canScreenshot = true;
  dom.childNodes.forEach((node) => {
    if (node.classList && node.classList.contains("screenshot")) {
      canScreenshot = false;
      return;
    }
  });
  return canScreenshot;
}
/**
 * 长按保存图片
 */
function saveImg(DOM, fileName) {
  // 想要保存的图片节点
  const dom = document.querySelector(DOM);
  // 假如已经生成节点了，直接返回
  if (!noCanvas(dom)) {
    return;
  } else {
    if (supportCanvas()) {
      //TODO 创建一个新的canvas

      // TODO 将Canvas画布放大scale倍，然后放在小的屏幕里，解决模糊问题

      // TODO 使用插件捷星截图
      html2canvas(dom, {
        canvas: Canvas,
        scale,
        useCORS: true,
        logging: true,
        scrollY: 0,
        scrollX: 0,
        backgroundColor: null,
      }).then((canvas) => {
        // ...

        // 替换图片
        const img = Canvas2Image.convertToPNG(
          canvas,
          canvas.width,
          canvas.height
        );
        img.style.position = "absolute";
        img.style.left = 0;
        img.style.top = 0;
        img.style.opacity = 0;
        img.style.width = $(DOM).width() + "px";
        img.style.zIndex = 10000;
        img.classList.add("screenshot");
        $(DOM).append(img);
        // 有些浏览器不能检测到base64的img标签，也就无法长按保存图片，因此现在是使用覆盖且长按下载来做的
        $(DOM).longPress(() => {
          Canvas2Image.saveAsPNG(canvas, canvas.width, canvas.height, fileName);
        });
      });
    } else {
      // ...
    }
  }
}
```

## 视频绘制

```javascript
let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");
let video = document.getElementById("video");

const TOLERANCE = 8;
// IMPORTANT 进行每个点的过滤
function cutOut() {
  let frameData = ctx.getImageData(0, 0, canvas.width, canvas.height),
    len = frameData.data.length / 4;

  for (let i = 0; i < len; i++) {
    let r = frameData.data[i * 4 + 0],
      g = frameData.data[i * 4 + 1],
      b = frameData.data[i * 4 + 2];
    if (r - 100 >= TOLERANCE && g - 100 >= TOLERANCE && b - 43 <= TOLERANCE) {
      frameData.data[i * 4 + 3] = 0;
    }
  }
  return frameData;
}
function draw() {
  if (video.paused || video.ended) {
    return;
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.putImageData(cutOut(), 0, 0);
}
video.addEventListener("play", function() {
  setInterval(() => {
    draw();
  }, 50);
});
```

## 数据报表绘制

`echarts`的图表大部分就是基于`canvas`绘图的，有兴趣可以看看
