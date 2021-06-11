## ❗ 实时推送-web worker

实话说，我见到一个完美的应用是在小广告中，下载的时候说需要你的权限，然后就开始无限的推送小弹窗 🤣;当然理论上是可以比如登录了一个商城，提醒顾客他购物车的商品降价了；比如在一个商家管理后台，有账号风险的时候及时弹窗告知用户去修改。

**离线功能**将颠覆原来的 web 退出后无法访问的障碍，真正让 web 应用化

![worker-lifestyle](/images/worker-lifecycle.png)

首先要使用要保证我们在电脑中设置了允许接受 chrome 消息，不然就没有用。

- 需要遵守 web push 协议 我们可以使用 [web push](https://github.com/web-push-libs/web-push)这个库去避免自己写
- push notification 是属于 service worker 的一部分，因此学 push notification 之前要先会 service worker

### start

注册的时候我们需要生成一个私钥和密钥去注册我们的 service worker

![service-worker](/images/service-worker.png)

注册我们的`service worker js`

```jsx
let swRegistration;
if ("serviceWorker" in navigator) {
  console.log("Service Worker and Push are supported");
  // 注册service worker
  navigator.serviceWorker.register("service-worker.js").then(function(swReg) {
    console.log("Service Worker is registered");
    swRegistration = swReg;
  });
}
```

在`service-worker.js`中写各种监听事件

```jsx
// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";
const PRECACHE_URLS = ["offline.html", "abc.html", "js/index.js", "index.html"];
const OFFLINE_URL = "offline.html";

// 监听事件 install
self.addEventListener("install", (event) => {
  event.waitUntil(
    // 缓存文件
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting()) // 强制让等待的service 变成active的service
  );
});

// 监听事件 activate
self.addEventListener("activate", (event) => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    // 检测不属于自己的缓存文件 及时删除
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 监听事件 fetch 拦截请求
self.addEventListener("fetch", (event) => {
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first.
          console.log(event.request);
          const networkResponse = await fetch(event.request);
          // return networkResponse;
        } catch (error) {
          console.log("Fetch failed; returning offline page instead.", error);
          // 找不到请求返回404 offline fallback
          const cache = await caches.open(PRECACHE);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }
});
```

`push notification`

```jsx
// 主要逻辑
let swRegistration;
if ("serviceWorker" in navigator) {
  //...
}

// 密钥解析
function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const pushButton = document.querySelector(".js-push-btn");
let isSubscributed = false;
let applicationServerKey;
// 后端请求
fetch("/keys")
  .then((res) => res.json())
  .then((data) => {
    applicationServerKey = data.keys;
  });

function subscribeUser() {
  isSubscributed = true;
  pushButton.textContent = "disable push messaging";

  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(applicationServerKey),
    })
    .then(function(subscription) {
      console.log("User is subscribed.");
      console.log(subscription);
      // 后端发送事件
      fetch("/subscribe", {
        body: JSON.stringify(subscription),
        method: "POST",
      });
    })
    .catch(function(error) {
      console.error("Failed to subscribe the user: ", error);
    });
}

function unsubscribeUser() {
  isSubscributed = false;
  pushButton.textContent = "enable push messaging";
  // 取消订阅
  swRegistration.pushManager
    .getSubscription()
    .then(function(subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.log("Error unsubscribing", error);
    });
}

// 添加点击事件
pushButton.addEventListener("click", function() {
  if (isSubscributed) {
    unsubscribeUser();
  } else {
    subscribeUser();
  }
});
```

`server.js`

```jsx
const Koa = require("koa");
const webpush = require("web-push");
const bodyparser = require("koa-bodyparser");
const path = require("path");

const app = new Koa();

app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);

app.use(require("koa-static")(__dirname + "/public"));

// VAPID 生成
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  "mailto:545220919@qq.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.use((ctx) => {
  if (ctx.request.path === "/keys") {
    ctx.body = { keys: vapidKeys.publicKey };
  }
  if (ctx.request.path === "/subscribe") {
    ctx.body = {};
    webpush
      .sendNotification(
        JSON.parse(ctx.request.body),
        JSON.stringify({
          title: "we are successful",
        })
      )
      .catch((err) => console.error(err));
  }
});

const port = 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
```

`service-worker.js` 增加监听

```jsx
// 发送事件时 要做啥
self.addEventListener("push", function(event) {
  console.log("[Service Worker] Push Received.");
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = "Push demo";
  const options = {
    body: "Yay it works.",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 点击消息
self.addEventListener("notificationclick", function(event) {
  console.log("[Service Worker] Notification click Received.");

  event.notification.close();

  event.waitUntil(clients.openWindow("https://developers.google.com/web/"));
});
```

试了下 在进行`push notification`订阅时会生成一个`endpoints` `keys`的 json 数组，这相当于用来标识订阅用户唯一的数据，如果真实开发中应该把这个数据存在数据库中（同样密钥公钥也是
