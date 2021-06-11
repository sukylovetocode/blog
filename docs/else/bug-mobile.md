# 移动端经历过的 BUG

## 1PX 问题

### 逻辑像素

**物理像素 \* window.devicePixelRatio = 逻辑像素**

### VIEWPORT 视口

指用户网页的可视区域。

当我们设置 `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` 要求视口（viewport）要与移动端页面宽度相同，因此为了填充页面，就会将我们设置的 css 按照`window.devicePixelRatio` 的分辨率扩展到合适的逻辑像素。

![原始](/images/1px1.png)

不加 viewport 页面的样子

![拉伸](/images/1px2.png)

加了 viewport 页面的自动拉伸

### SO

**因此，我们的 1PX 之所以会变宽是因为我们设置了物理像素的 PX，但移动端中我们设置适配时会自动帮我们拉伸到逻辑像素的 PX**

## 如何解决

- viewport + rem 方案 (通过将逻辑像素扩大到与物理像素一致)

```javascript
var viewport = document.querySelector("meta[name=viewport]");
if (window.devicePixelRatio == 1) {
  viewport.setAttribute(
    "content",
    "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
  );
}
if (window.devicePixelRatio == 2) {
  viewport.setAttribute(
    "content",
    "width=device-width, initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no"
  );
}
if (window.devicePixelRatio == 3) {
  viewport.setAttribute(
    "content",
    "width=device-width, initial-scale=0.333333333, maximum-scale=0.333333333, minimum-scale=0.333333333, user-scalable=no"
  );
}

var docEl = document.documentElement;
var fontsize = 100 * (docEl.clientWidth / 750) + "px"; // 1REM = ? 逻辑像素
docEl.style.fontSize = fontsize;
```

- transform(通过将线条从逻辑像素缩放成物理像素）

```css
/*设置height: 1px，根据媒体查询结合transform缩放为相应尺寸*/
div {
  height: 1px;
  background: #000;
  -webkit-transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  overflow: hidden;
}
/* 用::after和::befor,设置border-bottom：1px solid #000,然后在缩放-webkit-transform: scaleY(0.5);可以实现两根边线的需求 */
div::after {
  content: "";
  width: 100%;
  border-bottom: 1px solid #000;
  transform: scaleY(0.5);
}

/* 使用媒体查询进行优化 */
/* 2倍屏 */
@media only screen and (-webkit-min-device-pixel-ratio: 2) {
  .border-bottom::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}

/* 3倍屏 */
@media only screen and (-webkit-min-device-pixel-ratio: 3) {
  .border-bottom::after {
    -webkit-transform: scaleY(0.33);
    transform: scaleY(0.33);
  }
}
```

[1 像素边框问题](https://zhuanlan.zhihu.com/p/91830529)

## font-weight 在移动端失效

因为移动端内**缺乏对应粗细的字体**，而 PC 端存在，就会出现 PC 端加粗的字体到移动端失效了。

![字体粗](/images/fontWeight.png)

解决办法：设置`font-weight:700` 或者 `font-weight:bold` 即可
