# WebsqlWrapper 是一个简化 WebSQL 操作的 javascript库

WebsqlWrapper 名称的来历: WebSQL 包装器

原 2013 年写的版本已经跟不上 javascript 的骚了

2023 年，更新 ES module 版本

ES module 版更新内容:

- 支持 Promise, async/await 语法

- 新建数据库表格 api 变更

- 代码更易读(2013版差点我自己都看不懂了)



Typescript 版也要写


## 重要提示

WebSQL 是一种在浏览器中使用的关系型数据库，它使用 SQL 语言进行数据操作。WebSQL 存储限制是指在使用 WebSQL 进行数据存储时，浏览器对存储的数据量和大小所施加的限制。

不同的浏览器对于 WebSQL 存储限制有不同的规定。以下是一些常见的限制：

1. 存储容量限制：不同浏览器对于 WebSQL 存储容量的限制不同。一般来说，大多数浏览器对于单个域名下的 WebSQL 存储容量限制在 5MB 到 50MB 之间。

2. 存储表数量限制：某些浏览器对于单个数据库中的表数量有限制，一般在 1000 到 5000 之间。

3. 存储表大小限制：某些浏览器对于单个表的大小有限制，一般在 2MB 到 10MB 之间。

> 需要注意的是，WebSQL 已经被标准化组织废弃，不再被推荐使用。现代浏览器更倾向于使用 IndexedDB 或其他技术来进行客户端数据存储。如果需要在浏览器中进行数据存储，建议使用现代的客户端存储技术。

> Firefox 从未支持过 WebSQL，但其它浏览器到 2023 年为止都支持 WebSQL

## ES module 版 websqlwrapper.js 的使用

如果未使用 Webpack, vite 等打包工具

需要在 html 内使用 importmap 与 module 标明 script 类型

```
<script type="importmap">
    {
    "imports": {
        "WebsqlWrapper": "./WebsqlWrapper.js"
    }
    }
</script>
<script type="module">
    import { WebsqlWrapper } from 'WebsqlWrapper'
</script>
```

如果是在 webpack, vite 等打包工具下开发，则正常使用 es module 引入方式即可

## 新建数据库

正常引入 WebsqlWrapper 后 new 一个名为 'demoDB' db 实例

```
import { WebsqlWrapper } from 'WebsqlWrapper'
const db = new WebsqlWrapper({
    name: 'demoDB'
    , displayName:'demoDB1'
    , version:1
});

```
## 新建数据库表 

新建名为 'demo ' 的数据库表

```
const table = await db.createTable('demo', {id:'INTEGER UNIQUE', message:'TEXT NOT NULL', num: 'FLOAT'});
```

保存数据(插入或更新)

```
table.save({id: 1, message: 'yoyo', num: 123456}, 'id');
```

插入数据

```
table.insert({id: 8, message: '98fffffsxxx', num: 123});
```

更新数据

```
table.update({id: 2, message: 'fuckworld-updated111', num: 123}, 'id');
```

查询数据

```
const resultGet = await table.get('num === 123');
console.log('get 查询数据: ', resultGet);
```

直接使用 SQL 语句

```
const resultQuery = await db.query('SELECT * FROM demo')
console.log('查询结果 query: ', resultQuery);
```
