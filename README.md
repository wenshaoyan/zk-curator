# zk-curator
zookeeper客户端 nodejs版本，和curator的api风格一致。
主要对[node-zookeeper-client](https://github.com/alexguan/node-zookeeper-client)进行了二次封装。


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
##### build  创建client 
```js
curatorFrameworkFactor.build(function);
```


## client
连接zookeeper服务客户端


##### start 开始连接
```js
client.start();
```