const { CuratorFrameworkFactory } = require('../index');
let client;
client = CuratorFrameworkFactory.builder()
.connectString(process.env.ZK_URL1)
.namespace('a')
.build(main);   // 连接成功后的回调函数

// 打开连接
client.start();

async function main() {
    console.log('连接成功')
}