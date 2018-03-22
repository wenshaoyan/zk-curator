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
logger: 推荐使用[log42-node](https://github.com/wenshaoyan/log4j2-node)获取指定日志类 需要包括info等标准方法</br>
curatorFrameworkFactor.setLogger(logger)</br>
```js
const log4j2 = require('log42-node');
const log4j2Config = require('../config/log4j2.json');
log4j2.configure(log4j2Config);
let client;
client = CuratorFrameworkFactory.builder()
    .connectString(process.env.ZK_URL)
    .namespace(`http`)
    .setLogger(log4j2.getLogger('zookeeper'))
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
cache为永久监听器，包括NodeCache、PathCache、TreeCache三种。node对象数据格式:<br>
- path : 节点的完整路径。
- id : 节点的id。
- state : 节点的状态。
- data : 节点的数据。
- childrenData : 子节点的对象，包括迭代子节点的数据。对象的key为子节点的id，value为子节点的node对象。
- children : 子节点id的数组。
- tag : 标签 (通过setTag设置)。
#### addListener
增加监听的方法，格式为{eventName:function(cache,deep, changeNode),...}。<br>
eventName包括:
- childAdd:子节点添加时调用, 这里的changeNode为添加后的子节点的node对象。
- childRemove:子节点删除时调用, 这里的changeNode为删除前的子节点的node对象。
- nodeCreate:节点创建时候调用, 这里的changeNode为创建后的节点的node对象。
- nodeRemove:节点删除时候调用, 这里的changeNode为删除前的节点的node对象。
- nodeDataChange:节点数据改变时候调用, 这里的changeNode为修改前的节点的node对象。
#### setTag
设置标签：setTag(path, tag);<br>
path: string 要设置节点的完整路径,可通过node.path获取。<br>
tag: number 要设置节点tag。<br>
@return: bool 如果path找不到或者tag不为number,则返回false,设置成功返回true

#### getTag
设置标签：getTag(path);<br>
path: string 要获取节点的完整路径,可通过node.path获取。<br>
@return: node 如果path找不到则返回null,能找到则返回对应tag


#### NodeCache
监视一个结点的创建、更新、删除，并将结点的数据缓存在本地。NodeCache(Client,path):path节点的路径
```js
const {NodeCache} = require('zk-curator');
const nodeCache = new NodeCache(client,'/test/create');
nodeCache.addListener({
   nodeCreate: function (cache, deep, changeNode) {
       console.log('nodeCreate', deep, changeNode);
       console.log(cache.getData());
   },
   nodeRemove: function (cache, deep, changeNode) {
       console.log('nodeRemove', deep, changeNode);
       console.log(cache.getData());

   },
   nodeDataChange: function (cache, deep, changeNode) {
       console.log('nodeDataChange', deep, changeNode);
       console.log(cache.getData())
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
    childAdd: function (cache, deep, changeNode) {
        console.log('childAdd', deep, changeNode);
        console.log(cache.getData())
    },
    childRemove: function (cache, deep, changeNode) {
        console.log('childRemove', deep, changeNode);
        console.log(cache.getData())

    },
    nodeCreate: function (cache, deep, changeNode) {
        console.log('nodeCreate', deep, changeNode)
        console.log(cache.getData())
    },
    nodeRemove: function (cache, deep, changeNode) {
        console.log('nodeRemove', deep, changeNode);
        console.log(cache.getData())

    },
    nodeDataChange: function (cache, deep, changeNode) {
        console.log('nodeDataChange', deep, changeNode);
        console.log(cache.getData());
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
    childAdd: function (cache, deep, changeNode) {
        console.log('childAdd', deep, changeNode);
        console.log(cache.getData())
    },
    childRemove: function (cache, deep, changeNode) {
        console.log('childRemove', deep, changeNode);
        console.log(cache.getData())

    },
    nodeCreate: function (cache, deep, changeNode) {
        console.log('nodeCreate', deep, changeNode)
        console.log(cache.getData())
    },
    nodeRemove: function (cache, deep, changeNode) {
        console.log('nodeRemove', deep, changeNode);
        console.log(cache.getData())
    },
    nodeDataChange: function (cache, deep, changeNode) {
        console.log('nodeDataChange', deep, changeNode);
        console.log(cache.getData())
    }
});
treeCache.start();
```