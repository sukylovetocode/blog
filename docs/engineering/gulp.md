# gulp 的使用

## why 需要 gulp 工作流

我们平常开发的时候，前端常常会遇到这样的问题

- 要把代码压缩混淆
- 自动将我们的图片压缩优化
- 将 ES6 写的语言转化为更有兼容性的 ES5
- html 压缩
  这些东西如果只需要我们偶尔一次进行操作倒是还行，但问题是，前端页面通常会有很多的小改动，每次小改动都需要我们手工进行改动的时候，这就变成了一个繁琐的工作了，而这就是 gulp 的作用，将这些繁琐的工作自动化

## 基本使用

### 安装

`npm install gulp`

### 使用 - 建立任务

`gulpfile.js`

```javascript
const gulp = require("gulp");

// 复制文件
gulp.task("styles", async (cb) => {
  await gulp.src("app/css/*.css").pipe(gulp.dest("dist/css"));
});

// 新版
exports.task = (done) => {
  console.log("task");
  done(); // 任务完成需要自己手动调用
};
```

### 默认任务

```javascript
exports.default = (done) => {
  console.log("task");
  done(); // 任务完成需要自己手动调用
};
```

### 创建组合任务

```javascript
const { series, parallel } = require("gulp");
const task1 = (done) => {
  console.log("task1");
  done(); // 任务完成需要自己手动调用
};
const task2 = (done) => {
  console.log("task2");
  done(); // 任务完成需要自己手动调用
};

// 组合顺序任务
exports.task = series(task1, task2);

// 并行任务
exports.task = parallel(task1, task2);
```

#### 异步任务三种方式

```javascript
// 前面提到的done回调
exports.callback_error = (done) => {
  done(new Error("task failed!")); // 报错
};

// promise
exports.promise = () => {
  //Promise.reject(new Error('failed'))
  return Promise.resolve();
};

//async
const timeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
exports.async = async () => {
  await timeout(1000);
};

// steam 流模式 会有end事件 在哪里结束
const fs = require("fs");
exports.steam = () => {
  const readSteam = fs.createSteam("package.json");
  const writeSteam = fs.createWriteSteam("temp.txt");
  readSteam.pipe(writeStream);
  return readSteam;
};
```

#### 核心工作原理

```javascript
const fs = require("fs");
const { Transform } = require("stream");

exports.default = () => {
  const readSteam = fs.createSteam("normal.css");
  const writeSteam = fs.createWriteSteam("normal.min.css");
  // 文件转换流
  const transform = new Transform({
    transform: (chunk, encoding, callback) => {
      // 核心转换过程实现
      // chunk => 读取流中读取到的内容(Buffer)
      const input = chunk.toString();
      const output = input.replace(/\s+/g, "").replace(/\/\*.+?\*\//g, "");
      callback(null, output);
    },
  });
  readSteam.pipe(transform).pipe(writeStream);
  return readSteam;
};
```

#### 文件操作 API(读取流以及写入流)

```javascript
const { src, dest } = require("gulp");
const cleanCss = require("gulp-clean-css"); // 压缩css
const rename = reuiqre("gulp-rename"); // 重命名

exports.default = () => {
  return src("src/*.css")
    .pipe(cleanCss())
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest("dist"));
};
```

案例

- public 是直接复制即可的文件
- src 放置的是需要我们编译转换的文件

#### JS CSS HTML 的转换

```javascript
const { src, dest, parallel, series } = require("gulp");
const sass = require("gulp-sass");

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" }) //需要设置base 代表基准值，设置以后文件才会按当前格式路径保存
    .pipe(sass({ outputStyle: "expanded" })) // 默认带下划线文件是引用的，不会获取去压缩，通过outputstyle设置css样式完全展开，括号能够在单独一行
    .pipe(dest("dist"));
};

const babel = require("gulp-babel"); //@babel/core @babel/preset-env 插件也需要添加
const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(babel({ presets: ["@babel/preset-env"] })) //babel只是一个转换平台
    .pipe(dest("dist"));
};

const swig = require("gulp-swig");
const data = [
  {
    data1: "",
  },
];
const page = () => {
  return src("src/*.html", { base: "src" }) // 不同目录 src/**/*.html
    .pipe(swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest("dist"));
};

const compile = parallel(style, script, page);

module.exports = {
  compile,
};
```

#### 图片和字体文件处理

```javascript
const imagemin = require("gulp-imagemin"); // 只能npm下载
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(imagemin())
    .pipe(dest("dist"));
};

const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(imagemin()) // 无法压缩的文件不会处理直接拷贝 字体文件有svg
    .pipe(dest("dist"));
};
```

#### 其他文件以及文件清除

```javascript
//直接拷贝
const extra = () => {
  return src("public/**", { base: "public" }).pipe(dest("dist"));
};

const del = require("del"); // 不是gulp插件
const clean = () => {
  return del(["dist"]);
};

const build = series(clean, parallel(compile, extra));
```

#### 自动加载插件

```javascript
const loadPlugins = require("gulp-load-plugins");
const plugins = loadPlugins();

// 使用插件
plugins.sass;
plugins.babel;
plugins.aB; // gulp-a-b
```

#### 热更新开发服务器

```javascript
const browserSync = require('browser-sync')
const bs = browserSync.create()

const serve = () => {
  bs.init({
    notify: false, // 是否开启提示
    port: 2080, // 端口
    // open: false, // 自动打开浏览器
    // files: 'dist/**', // 监听路径
    server: {
      baseDir: 'dist',
      routes: {
        '/node_modules': 'node_modules' //让文件变成对的路径
      }
    }
  })
```

#### 监听变化

```javascript
const { watch } = require("gulp");
const serve = () => {
  watch("src/assets/styles/*.scss", style);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  // 无损压缩，开发监视没有意义，仅需要刷新浏览器
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    bs.reload
  );

  bs.init({
    notify: false,
    port: 2080,
    // open: false,
    // files: 'dist/**',
    server: {
      baseDir: ["dist", "src", "public"], // 静态资源会按目录一个个找
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};

const page = () => {
  return src("src/*.html", { base: "src" }) // 不同目录 src/**/*.html
    .pipe(swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest("dist"))
    .pipe(bs.reload({ stream: true })); // 内容更新也需要更新浏览器
};
```

### user ref 文件处理

```html
<!-- 编写构建目录 -->
<!-- build:css assets/styles/vendor.css -->
<link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css" />
<!-- endbuild -->
```

```javascript
// compile 后使用 否则注释可能已经删除 无法压缩
const useref = () => {
  return (
    src("dist/*.html", { base: "dist" })
      .pipe(plugins.useref({ searchPath: ["dist", "."] })) // 文件合并所要去找的文件
      // html js css 分别操作
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true, //删除空格
            minifyCSS: true,
            minifyJS: true,
          })
        )
      )
      .pipe(dest("release"))
  ); // 放在不同目录中否则会有冲突
};
```

#### 复用代码段

- github 中创建仓库
- 建立个人脚手架并初始化提交
- npm link 脚手架 进行使用测试
- 抽象配置文件`pages.conf.js`

```javascript
module.exports = {
    data:{
        ...
    }
}

// 引入抽象配置
// 返回当前程序工作目录
const cwd = process.cwd()
let config = {
    // default config
}
try{
    config = require(`${cwd}/pages.config.js`) //Object.assign() 合并对象
}catch(e){}

// 需要修改模块引用
.pipe(plugins.babel({ presets: ['@babel/preset-env'] }))

.pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
```

- 抽象路径配置 路径都抽取出来使得可以配置
- 包装 gulp-cli

文件在 node_modules 中，假如我们找到具体目录进行使用也是可以的，但是路径复杂 我们可以自己集成路径自己调用
可以不再自己配一个`gulpfile.js` 引用

新建`bin`文件夹 在里面建立`pages.js`
在`package.json`中修改我们的配置，增加一行`"bin":"bin/pages"` 就可以直接运行`pages`命令
`pages.js`写入

```javascript
#!/usr/bin/env node
process.argv.push("--cwd");
process.argv.push(process.cwd()); // 指定当前文件路径
process.argv.push("--gulpfile");
process.argv.push(require.resolve("..")); // 我们gulpfile的路径
require("gulp/bin/gulp");
```

- 发布并使用
  要发布的文件夹需要在`package.json`中的 files 指定`["lib","bin"]`

### 监视我的文件

```javascript
gulp.task("watch", function() {
  // 文件变化时，要执行什么任务
  gulp.watch("app/images/*", gulp.series("images"));
  gulp.watch("app/js/*.js", gulp.series("js"));
});
```

### 图片压缩

#### 安装插件

`npm install imagemin-mozjpeg imagemin-pngquant imagemin-svgo gulp-imagemin gulp-cache`

```javascript
var imagemin = require("gulp-imagemin");
var imageminMozjpeg = require("imagemin-mozjpeg");
var imageminSvgo = require("imagemin-svgo");
var pngquant = require("imagemin-pngquant");
var cache = require("gulp-cache");

gulp.task("images", async () => {
  // 找到图片
  await gulp
    .src("app/images/*")
    .pipe(
      cache(
        imagemin(
          [
            pngquant(),
            imageminMozjpeg({
              quality: 80,
            }),
            imageminSvgo(),
          ],
          {}
        )
      )
    )
    .pipe(gulp.dest("dist/images"));
});
```

### JS 混淆编译 + 转换为 ES5

`npm install gulp-uglify gulp-babel @babel/core @babel/preset-env`

配置.babelrc

```
{
    "presets": ["@babel/preset-env"]
}
```

```javascript
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

gulp.task("js", async () => {
  await gulp
    .src("app/js/**/*.js")
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
});
```
