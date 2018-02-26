# zk-curator
zookeeper客户端 nodejs版本，和curator的api风格一致。
主要对[node-zookeeper-client](https://github.com/alexguan/node-zookeeper-client)进行了二次封装。

## 对比node-zookeeper-client的新功能
- 基于Promise调用
- Fluent风格的API接口
- 递归创建、删除节点
- 命名空间
- 实时获取某个节点及该节点下所有子节点的信息 
## Install

```bash
$ npm install zk-curator
```
## 连接zookeeper
```js
const { CuratorFrameworkFactory }  = require('zk-curator');
let client;
client = CuratorFrameworkFactory.builder()
.connectString(process.env.ZK_URL)
.namespace(`http`)
.build(main);   // 连接成功后的回调函数

// 打开连接
client.start();

async function main() {
	console.log('连接成功')
}

```

## Example





## Documentation
### 连接
##### 构造CuratorFrameworkFactory
```js
const { CuratorFrameworkFactory } = require('zk-curator');
const curatorFrameworkFactory = CuratorFrameworkFactory.builder()

```

##### connectString 设置连接地址 
url:zookeeper连接地址 多个以逗号隔开(ip:port;ip:port)
```js
curatorFrameworkFactor.connectString(url);
```

##### namespace 
设置当前连接的namespace (命名空间)
str:如http/develop  不能以/开头
```js
curatorFrameworkFactor.namespace(str);
```


##### setLogger 设置日志 
logger: 推荐使用log4js获取指定日志类 需要包括info等标准方法</br>
curatorFrameworkFactor.setLogger(logger)</br>
```js
const log4js = require('log4js');
const log4jsConfig = require('../config/log4js.json');
log4js.configure(log4jsConfig);
let client;
client = CuratorFrameworkFactory.builder()
    .connectString(process.env.ZK_URL)
    .namespace(`http`)
    .setLogger(log4js.getLogger('zookeeper'))
    .build(main);
client.start();

async function main() {
	console.log('连接成功')
}

```

### client

#### Client start()
启动连接到所提供的服务器列表或集合。客户端将从列表中选择任意的服务器，并尝试连接到该列表。如果连接的建立失败，将尝试另一个服务器(随机选择)，直到建立连接或关闭方法。

#### void close()
关闭这个客户端。一旦客户端关闭，它的会话就会失效。与会话关联的zookeeper服务器上的所有临时节点将被删除。

#### create()
#### checkExists()
#### getChildren()
#### delete()


### cache
cache为永久监听器，包括NodeCache、PathCache、TreeCache三种。
#### addListener
增加监听的方法，格式为{eventName:function(cache,deep),...}。<br>
eventName包括:
- childAdd:子节点添加时调用
- childRemove:子节点删除时调用
- nodeCreate:节点创建时候调用
- nodeRemove:节点删除时候调用
- nodeDataChange:节点数据改变时候调用

cache: 当前的cache对象()
#### NodeCache
监视一个结点的创建、更新、删除，并将结点的数据缓存在本地。NodeCache(Client,path):path节点的路径
```js
const {NodeCache} = require('zk-curator');
const nodeCache = new NodeCache(client,'/test/create');
        nodeCache.addListener({
            nodeCreate: function (cache, deep) {
                console.log('nodeCreate')
                console.log(cache.state)
                console.log(cache.data)
            },
            nodeRemove: function (cache, deep) {
                console.log('nodeRemove');
                console.log(cache.state)
                console.log(cache.data)

            },
            nodeDataChange: function (cache, deep) {
                console.log('nodeDataChange')
                console.log(cache.state)
                console.log(cache.data)
            }
        });
        nodeCache.start();
```

#### PathCache
监视一个结点的创建、更新、删除，子节点的创建更新，并将结点的数据缓存在本地。PathCache(Client,path):path节点的路径
```js
const {PathCache} = require('zk-curator');
const pathCache = new PathCache(client,'/test');
        pathCache.addListener({
            childAdd: function (cache, deep) {
                console.log('childAdd');
                console.log(cache.state);
                console.log(cache.data)
                console.log(cache.children)
            },
            childRemove: function (cache, deep) {
                console.log('childRemove');
                console.log(cache.state);
                console.log(cache.data)
                console.log(cache.children)

            },
            nodeCreate: function (cache, deep) {
                console.log('nodeCreate')
                console.log(cache.state)
                console.log(cache.data)
            },
            nodeRemove: function (cache, deep) {
                console.log('nodeRemove');
                console.log(cache.state)
                console.log(cache.data)

            },
            nodeDataChange: function (cache, deep) {
                console.log('nodeDataChange');
                console.log(cache.state);
                console.log(cache.data);
            }
        });
        pathCache.start();

```

#### TreeCache
监视一个结点的创建、更新、删除，及子节点的创建、更新、删除， 从数并将结点的数据缓存在本地。TreeCache(Client, path, maxDeep):path节点的路径 maxDeep最大深度。、
如:path=/test，那么/test的deep=0; /test/a/b/c为3。当maxDeep=2时候，最大可监听/test/a/b的子节点的变化，也就是当创建/test/a/b/c时候，
会触发/test/a/b的childAdd事件，并且不能监听/test/a/b/c节点的变化。
 
```js
const {TreeCache} = require('zk-curator');
const treeCache = new TreeCache(client,'/test', 2);
        treeCache.addListener({
            childAdd: function (cache, deep) {
                console.log('childAdd',deep);
                console.log(treeCache.data)
            },
            childRemove: function (cache, deep) {
                console.log('childRemove',deep);
                console.log(treeCache.data)

            },
            nodeCreate: function (cache, deep) {
                console.log('nodeCreate', deep)
                // console.log(treeCache.data)
            },
            nodeRemove: function (cache, deep) {
                console.log('nodeRemove', deep);
                // console.log(treeCache.data)
            },
            nodeDataChange: function (cache, deep) {
                console.log('nodeDataChange', deep);
                console.log(treeCache.data)
            }
        });
        treeCache.start();
```