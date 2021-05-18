module.exports = {
  title: "suky blog",
  description: "just for fun",
  base: "/",
  configureWebpack: {
    resolve: {
      alias: {
        "@alias": "",
      },
    },
  },
  markdown: {
    lineNumbers: false, // 代码块显示行号
  },
  themeConfig: {
    nav: [
      // 导航栏配置
      { text: "首页", link: "/" },
      { text: "功能实现", link: "/modules/" },
      { text: "理论", link: "/theory/" },
      { text: "可视化", link: "/visualization/" },
      { text: "前端工程化", link: "/engineering/" },
      { text: "其他", link: "/else/" },
    ],
    sidebar: {
      "/engineering/": ["", "gulp", "seo", "webpack-hmr"],
    },
  },
};
