<h2><a name="" class="anchor" href="#"><span class="mini-icon mini-icon-link"></span></a>介绍</h2>
<p>WebsqlWrapper是一个简化websql操作的javascript库，在BSD协议下开源发布。</p>

<p>WebsqlWrapper名称的来历: websql 包装器。</p>

<h2>
<a name="-1" class="anchor" href="#-1"><span class="mini-icon mini-icon-link"></span></a>如何使用</h2>

<p>引用websqlwrapprjs</p>

<pre><code><script src="websqlwrapper.js"></script>
</code></pre>

<p>1、建立数据库</p>
<p>注意：建立数据库是同步操作</p>
<pre><code>var db = new WebsqlWrapper({
          name: 'demoDB'
        , displayName:'demoDB1'
        , version:1
    });
</code></pre>

<p>2、建立一张数据表名为demo数据表</p>
<p>demoReady 为建立数据表成功后的回调</p>
<pre><code>db.query('CREATE TABLE IF NOT EXISTS demo(id INTEGER UNIQUE, message TEXT NOT NULL, num FLOAT);', demoReady);
</code></pre>

<p>在demoReady回调中，就可进行对表进行操作了</p>
<p>保存一条数据, save: 更新或插入</p>
<p>注意：需要传第三个参数key</p>
<pre><code>db.save('demo', {id: 1, message: 'helloworld', num: 123456}, 'id');
</code></pre>

