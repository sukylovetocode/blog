# 什么是前端工程化

## 为什么需要前端工程化

- 手动压缩手动上传这类重复工作
- ES6 不能直接兼容
- 模块化无法直接读取
- 代码风格代码质量无法保证

## 脚手架工具开发

创建项目基础结构、提供项目规范和约定，常用 Yeoman Plop

#### Yeoman

##### 下载脚手架安装工具

`npm install -g yo`

##### 下载合适的脚手架 generator

`npm install -g generator-<name>`

##### 安装脚手架

`yo <name>`

##### 在原本存在的项目中进行一点改动 Sub Generator

具体支持什么 Sub-generator 则需要我们自己去文档查看
如 `yo node:cli`

##### 下载时可能需要的镜像源

![](/images/mirror.png)

##### yeoman 预先定义顺序方法

```javascript
initializing -- 初始化方法（检查状态、获取配置等）
prompting -- 获取用户交互数据（this.prompt()）
configuring -- 编辑和配置项目的配置文件
default -- 如果generator内部还有不符合任意一个任务队列任务名的方法，将会被放在default这个任务下进行运行
writing -- 填充预置模板
conflicts -- 处理冲突（仅限内部使用）
install -- 进行依赖的安装（eg：npm，bower）
end -- 最后调用，做一些clean工作
```

##### 自定义的 Generator

```
generators/ 生成器目录
 app/       默认生成器目录
    index.js    核心入口
package.json
```

脚手架必须要求以`generator-<name>`命名

```javascript
npm init
npm install yeoman-generator
```

index.js

```javascript
//需要导出一个继承Yeoman-Genarator的类型，我们在其中使用一些生命周期办法，实现我们的自定义脚手架
const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  writing() {
    // 写入文件，例子 写入一个有随机数的文件
    this.fs.write(this.destinationPath("temp.txt"), Math.random().toString());
  }
};
```

链接文件成为全局模块包
`npm link` 然后就可以全局通过`yo <name>`在本地生成脚手架

##### 根据模板生成文件

支持**EJS**语法,动态输入内容替换`<%= name %>`,原封不动输出`<%%= name %>`

在`app`文件夹中设置`templates`文件夹，存放需要拷贝的文件

```javascript
const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  writing() {
    const tmpl = this.templatePath("<file-name>"); // 自动检索templates文件夹下的内容
    const output = this.destinationPath("foo.txt"); // 输出文件名
    const context = { title: "hello" };

    this.fs.copyTpl(tmpl, output, context);

    // 多个文件，就编写数组，循环生成
  }
};
```

##### 接受用户输入

```javascript
module.exports = class extends Generator {
  prompting() {
    // 询问用户
    return this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname, //appname为项目生成目录名称
      },
      {
        type: "list",
        name: "framework",
        message: "choose a framework",
        choices: ["React", "Vue", "Angular"],
        default: "React",
      },
    ]).then((ans) => {
      // ans => { name:'user input val'}
      this.answer = answers;
    });
  }
};
```

##### 发布 generator

提交到 github
`npm publish` 版本号是否修改 ，且不能发布到淘宝镜像源

#### Plop

创建项目中某个模块经常需要

##### 如何使用

下载`npm install plop --save-dev`

在根目录下创建`plopfile.js`

在`plopfile.js`中编写我们需要的东西

```javascript
module.exports = plop => {
    plop.setGenerator('component',{
        description: 'create a component',
        prompts:[
            {
                type: 'input',
                name:'name',
                message: 'Your project name',
                default: 'MyCompnent'
            }
        ],
        actions: [
            {
                type: 'add', // 提交文件
                path: 'src/components/{{name}}/{{name}}.js',// 双括号取值
                templateFile: ''
            },
            {...}// 添加多个actions就能生成多个文件
        ]
    })
}
```

拷贝的文件设置在`plop-templates`文件夹中，文件以`<name>.hbs`命名，使用双括号赋值

输入命令`plop component`可以使用我们的 plop

#### 脚手架工作原理

依靠`node-cli`实现

node 命令行询问`npm install inquirer`
`npm install ejs` 模板引擎
设置`templates`文件夹编写模板文件

在`cli.js`中

```javascript
#!/usr/bin/env node

// node cli都要有这样的文件头
// 如果是Linux或者macOS则还需要修改文件读写权限 755 （chmod 755 cli.js)

// 脚手架工作过程：交互提问、根据结果生成文件
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const ejs = require('ejs')

inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name'
    }
]).then(ans => {
    // 模板目录
    const tmplDir = path.join(__dirname,'templates')
    // 目标目录
    const destDir = process.cwd()
    // 模板下文件复制
    fs.readdir(tmplDir, （err,files) =>{
        if(err) throw err
        files.forEach(file => {
            // 模板引擎复制
            ejs.renderFile(path.join(tmplDir,file), ans,(err,result) => {
                if(err) throw err
                fs.writeFileSync(path.join(destDir,file),result)
            }
        })
    })
})
```

`npm link`
输入文件名就可以正常跑 cli.js 文件 ,引用方和使用方都需要

## 自动化构建工作流

重复工作就交给自动化

- npm scripts
  设置`serve:<cmd>`我们可以通过`preserve:<cmd>`来设置钩子，那么我们在 scripts 运行之前会自动运行`pre-<name>`

`npm install npm-run-all` 能让我们 scripts 同步运行`start:run-p <cmd1> <cmd2>`

例如
`sass scss/main.css css/style.css --watch`& `browser-sync . --files \"css/*.css\""` 自动检测变化，修改就可以及时更新

### 常用的工作流工具

- Grunt 最老 磁盘读写 构建速度慢
- Gulp 好用 内存读写
- FIS 捆绑套餐 基本没人用

### Grunt

`npm install grunt`
新建`gruntfile.js`

```javascript
// 定义Grunt自动执行的任务
module.exports = grunt => {
    grunt.registerTask('<task name>', '任务描述',() => {
        // do sth
    })
    // defult表示默认任务，直接用grunt调用
     grunt.registerTask('<task name>', [<task1>,<task2>])
}
```

使用`grunt <task>`能够直接进行任务调用

需要异步任务时

```javascript
grunt.registerTask("<task name>", function() {
  const done = this.async();
  setTimeout(() => {
    done(); // 需调用该函数才知道是任务执行完成
  }, 1000);
});
```

标记失败任务

```javascript
grunt.registerTask("<task name>", function() {
  return false; // 表示失败任务
  //done(false) 异步失败任务
});
```

配置选项

```javascript
module.exports = (grunt) => {
  grunt.initConfig({
    foo: "bar",
    obj: {
      a: 123,
    },
  });
  //调用
  grunt.config("foo");
  grunt.config("obj.a");
};
```

多目标任务,子任务

```javascript
module.exports = (grunt) => {
  grunt.initConfig({
    build: {
      options: {}, // 任务配置选项
      css: {
        options: {}, // 任务配置选项
        a: "1",
      },
      js: "2",
    },
  });
  grunt.registerMultiTask("build", function() {
    // this.options()得到所有配置选项
    // this.target 得到config的key css/js
    // this.data 得到config中的值 '1' /'2'
  });
};
```

Grunt 插件的使用

```javascript
module.exports = grunt => {
    grunt.initConfig({
       clean：{
           temp: 'temp/app.js' //temp/*.js temp/** 使用通配符也可以
       }
   })
    grunt.loadNpmTasks('grunt-contrib-clean') // 需要提前npm下载 多目标 最后的名字clean就是运行的<task>名字
}
```

常用插件

- sass

```javascript
// npm install sass grunt-sass
const sass = require("sass");
module.exports = (grunt) => {
  grunt.initConfig({
    sass: {
      options: {
        sourceMap: true,
        implementation: sass, // 实现
      },
      main: {
        files: {
          "dist/css/main.css": "src/scss/main.scss",
        },
      },
    },
  });
  grunt.loadNpmTasks("grunt-sass"); // 需要提前npm下载 多目标 最后的名字clean就是运行的<task>名字
};
```

- babel

```javascript
// npm install grunt-babel @babel/core @babel/preset-env
const loadGruntTasks = require("load-grunt-tasks"); // 方便加载多个npm task
module.exports = (grunt) => {
  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        presets: ["@babel/preset-env"], // 实现
      },
      main: {
        files: {
          "dist/js/app.js": "src/js/app.js",
        },
      },
    },
  });
  loadGruntTasks(grunt); // 自动加载grunt中所有插件任务
};
```

- grunt-contrib-watch 监听更改

```javascript
module.exports = (grunt) => {
  grunt.initConfig({
    watch: {
      js: {
        files: ["src/js/*.js"],
        tasks: ["babel"],
      },
      css: {
        files: ["src/scss/*.scss"],
        tasks: ["sass"],
      },
    },
  });
};
```
