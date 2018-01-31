const { CuratorFrameworkFactory } = require('../index');
let client;
client = CuratorFrameworkFactory.builder()
.connectString(process.env.ZK_URL)
.namespace('http')
.setOptions({
    sessionTimeout: 1000
})
.build(main);   // 连接成功后的回调函数

// 打开连接
client.start();

async function main() {
    console.log('连接成功')
}