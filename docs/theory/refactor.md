## 重构-做更好的自己

### 循环重构

#### 拆装 if-else

恶心全家的 if-else 语句,三个嵌套 if 能够得到 2 ^ 3 = 8 种，这种指数级增长很可怕。到最后维护的时候你就“后悔莫及”

```javascript
function demo(a, b, c) {
  if ((x = a)) {
    if (g(a, b, c)) {
      // ...
    }
    // ...
    if ((x = b)) {
      // ...
    }
  }

  if ((x = c)) {
    // ...
  }

  if ((x = d)) {
    // ...
  }
}
```

##### 重构策略

![](/images/if-loop-refractor.png)

拆成几个函数，将函数复杂度增长速度从指数级降低到了线性级。

```javascript
function demo(a, b, c) {
  if ((x = a)) {
    g(); // 第一个函数
  }

  if ((x = c)) {
    h(); // 第二个函数
  }
}
```

#### else if 分组

```javascript
function demo(a, b, c) {
  if (f(a, b, c)) {
    // ...
  } else if (j(a, b, c)) {
    // ...
  } else if (k(a, b, c)) {
    // ...
  }
}
```

#### 重构策略

对于 else if...else if 类型的面条代码，一种最简单的重构策略是使用所谓的**查找表**。它通过键值对的形式来封装每个 else if 中的逻辑：

```javascript
const rules = {
  x: function(a, b, c) {
    /* ... */
  },
  y: function(a, b, c) {
    /* ... */
  },
  z: function(a, b, c) {
    /* ... */
  },
};

function demo(a, b, c) {
  const action = determineAction(a, b, c);
  return rules[action](a, b, c);
}
```

#### else if 升级

在上文中，查找表是用键值对实现的，对于每个分支都是 else if (x === 'foo') 这样简单判断的情形时，'foo' 就可以作为重构后集合的键了。但如果每个 else if 分支都包含了复杂的条件判断，且其对执行的先后顺序有所要求，那么我们可以用**职责链模式**来更好地重构这样的逻辑。

```javascript
const rules = [
  {
    match: function(a, b, c) {
      /* ... */
    },
    action: function(a, b, c) {
      /* ... */
    },
  },
  {
    match: function(a, b, c) {
      /* ... */
    },
    action: function(a, b, c) {
      /* ... */
    },
  },
  {
    match: function(a, b, c) {
      /* ... */
    },
    action: function(a, b, c) {
      /* ... */
    },
  },
  // ...
];
function demo(a, b, c) {
  for (let i = 0; i < rules.length; i++) {
    if (rules[i].match(a, b, c)) {
      return rules[i].action(a, b, c);
    }
  }
}
```

参考链接
[如何无痛降低 if else 面条代码复杂度](https://juejin.cn/post/6844903502611759117)
