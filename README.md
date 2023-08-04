WebSQL 是一种在浏览器中使用的关系型数据库，它使用 SQL 语言进行数据操作。WebSQL 存储限制是指在使用 WebSQL 进行数据存储时，浏览器对存储的数据量和大小所施加的限制。

不同的浏览器对于 WebSQL 存储限制有不同的规定。以下是一些常见的限制：

1. 存储容量限制：不同浏览器对于 WebSQL 存储容量的限制不同。一般来说，大多数浏览器对于单个域名下的 WebSQL 存储容量限制在 5MB 到 50MB 之间。

2. 存储表数量限制：某些浏览器对于单个数据库中的表数量有限制，一般在 1000 到 5000 之间。

3. 存储表大小限制：某些浏览器对于单个表的大小有限制，一般在 2MB 到 10MB 之间。

需要注意的是，WebSQL 已经被标准化组织废弃，不再被推荐使用。现代浏览器更倾向于使用 IndexedDB 或其他技术来进行客户端数据存储。如果需要在浏览器中进行数据存储，建议使用现代的客户端存储技术。

<h2><a name="" class="anchor" href="#"><span class="mini-icon mini-icon-link"></span></a>介绍</h2>
<p>WebsqlWrapper是一个简化websql操作的javascript库，在BSD协议下开源发布。</p>

<p>WebsqlWrapper名称的来历: websql 包装器。</p>
<p>此库的所有操作都是异步的，虽然websql提供同步操作接口，但为了UI考虑，本库暂时只提供异步操作</p>
<br />
<hr />
<h2>
<a name="-1" class="anchor" href="#-1"><span class="mini-icon mini-icon-link"></span></a>如何使用</h2>

<p>在html中引用websqlwrapprjs</p>

<pre><code>"websqlwrapper.js"
</code></pre>

<h3>1、建立数据库</h3>
<p>注意：建立数据库是同步操作</p>
<pre><code>var db = WebsqlWrapper({
          name: 'demoDB'
        , displayName:'demoDB1'
        , version:1
    });
</code></pre>
<p>或,以传统方式new一个数据库出来</p>
<pre><code>var db = new WebsqlWrapper({
          name: 'demoDB'
        , displayName:'demoDB1'
        , version:1
    });
</code></pre>

<h3>2、建立一张数据表名为demo数据表</h3>
<p>第一个参数是表名，第二个参数即字段对象,键/值形式，值代表字段对应的类型限制</p>
<p>demoReady 为建立数据表成功后的回调</p>
<pre><code>db.define('demo', {id:'INTEGER UNIQUE', message:'TEXT NOT NULL', num: 'FLOAT'}, demoReady);
</code></pre>

<h3>3、操作数据表</h3>
<p>在demoReady回调中，就可进行对表进行操作了</p>
<p>操作数据表，首先得获得一个数据表的实例</p>
<pre><code>var table = db.instance('demo');
</code></pre>

<p>保存一条数据, save: 更新或插入</p>
<p>注意：需要传第二个参数key</p>
<pre><code>table.save({id: 1, message: 'helloworld', num: 123456}, 'id');
</code></pre>

<p>插入数据, insert: 更新或插入</p>
<p>注意：由于我们设置了id字段为unique所以当程序执行第二遍时控制台会输出错误信息</p>
<pre><code>table.insert({id: 2, message: 'fuckworld', num: 123});
        table.insert({id: 3, message: 'hi', num: 123});
</code></pre>

<p>更新数据, update</p>
<p>注意：需要传第二个参数key</p>
<pre><code>table.update({id: 2, message: 'fuckworld-updated', num: 123}, 'id');
</code></pre>

<p>获取数据, get</p>
<pre><code>table.get('num === 123', function(r){
        	console.log('查询数据: ', r);
        });
</code></pre>
<br /><br />
<hr />
<br /><br />
<p>SQL语句执行函数, query</p>
<pre><code>db.query('SELECT * FROM demo', function(r){
        	console.log('查询结果: ', r);
        });
</code></pre>

<p>批处理操作, batch</p>
<p>可以定义一个数组，数组项为需要操作的数据库命令，来批处理操作，列如：一次性插入，更新，删除，保存等操作</p>
<p>注意：在本库中，暂时所有的数据库API都只提供异步操作，所以在处理多条数据操作时此命令特别重要，等所有命令处理完后即可以回调中放心继续其它操作</p>
<pre><code>
	// 定义一个命令数组
		var arr = [
        	  {type: 'save', args: [{id: 4, message: 'my name is lilei11', num: 207}, 'id', function(){ console.log('save finished'); }]}
            , {type: 'save', args: [{id: 5, message: 'my name is hameimei', num: 201}, 'id']}
            , {type: 'query', args: ['SELECT * FROM demo where id = ?', [1], function(){ console.log('query finished'); }]}            
        ];
		// table批处理
        table.batch(arr);
        });
        
        //db的批处理
        var arr2 = [
             {type: 'save', args: ['demo', {id: 5, message: 'my name is hameimei', num: 201}, 'id', function(){ console.log('save finished'); }]}  //除了query之外方法，args数组第一个元素是tableName
           , {type: 'query', args: ['SELECT * FROM demo where id = ?', [1], function(){ console.log('query finished'); }]}      
        ];
        db.batch(arr2);
</code></pre>
<hr />
