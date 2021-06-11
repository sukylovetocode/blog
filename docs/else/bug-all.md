# 普通 BUG

## img 底部空白间隙

![img 底部空白间隙](/images/imgWhite.png)

这是因为图片属于 inline 元素，他的 vertical-align 默认值是 baseline，就是以 x 字母下方为基准。

### 解决办法

- 修改行内元素垂直居中方式

```css
img {
  vertical-align: bottom;
}
```

- 使行高变小

```css
div {
  line-height: 0px;
}
```

- 修改行内字体大小

```css
div {
  font-size: 0px;
}
```

- 让 img 变成块级元素

```css
img {
  display: block;
}
```
