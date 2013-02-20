<h2><a name="" class="anchor" href="#"><span class="mini-icon mini-icon-link"></span></a>介绍</h2>
<p>WebsqlWrapper是一个简化websql操作的javascript库，在BSD协议下开源发布。</p>

<p>WebsqlWrapper名称的来历: websql 包装器。</p>

<h2>
<a name="-1" class="anchor" href="#-1"><span class="mini-icon mini-icon-link"></span></a>如何使用</h2>

<p>在html中引用websqlwrapprjs</p>

<pre><code>"websqlwrapper.js"
</code></pre>

<h3>1、建立数据库</h3>
<p>注意：建立数据库是同步操作</p>
<pre><code>var db = new WebsqlWrapper({
          name: 'demoDB'
        , displayName:'demoDB1'
        , version:1
    });
</code></pre>

<h3>2、建立一张数据表名为demo数据表</h3>
<p>demoReady 为建立数据表成功后的回调</p>
<pre><code>db.query('CREATE TABLE IF NOT EXISTS demo(id INTEGER UNIQUE, message TEXT NOT NULL, num FLOAT);', demoReady);
</code></pre>

<h3>3、操作数据表</h3>
<p>在demoReady回调中，就可进行对表进行操作了</p>

<p>保存一条数据, save: 更新或插入</p>
<p>注意：需要传第三个参数key</p>
<pre><code>db.save('demo', {id: 1, message: 'helloworld', num: 123456}, 'id');
</code></pre>

<p>插入数据, insert: 更新或插入</p>
<p>注意：由于我们设置了id字段为unique所以当程序执行第二遍时控制台会输出错误信息</p>
<pre><code>db.insert('demo',{id: 2, message: 'fuckworld', num: 123});
        db.insert('demo',{id: 3, message: 'hi', num: 123});
</code></pre>

<p>更新数据, update</p>
<p>注意：需要传第三个参数key</p>
<pre><code>db.update('demo',{id: 2, message: 'fuckworld-updated', num: 123}, 'id');
</code></pre>

<p>获取数据, get</p>
<pre><code>db.get('demo', 'num === 123', function(r){
        	console.log('查询数据: ', r);
        });
</code></pre>

<hr />

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
        	  {type: 'save', item: {id: 4, message: 'my name is lilei11', num: 207}, args: 'id'}
            , {type: 'save', item: {id: 5, message: 'my name is hameimei', num: 201}, args: 'id'}
            , {type: 'query', item: 'SELECT * FROM demo'}
            , {type: 'query', item: 'SELECT * FROM demo'}
        	, {type: 'query', item: 'SELECT * FROM demo'}
        ];
		// 批处理
        db.batch('demo', arr, function(r){
        	console.log('批处理操作成功！');
        });
</code></pre>

<hr />