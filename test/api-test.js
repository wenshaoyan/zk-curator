/**
 * Created by wenshao on 2018/2/25.
 */
'use strict';
const { CuratorFrameworkFactory } = require('../index');
let client;
client = CuratorFrameworkFactory.builder()
    .connectString(process.env.ZK_URL)
    .namespace('test')
    .setOptions({
        sessionTimeout: 1000
    })
    .build(main);   // 连接成功后的回调函数

// 打开连接
client.start();

async function main() {
    const id = await client.create()
        .withMode(CuratorFrameworkFactory.EPHEMERAL)
        .forPath('/create',JSON.stringify({
            ip: '127.0.0.1',
            port: 3000
        }));
    console.log(id);
    setTimeout(function () {
        client.close();
    },10000);
}
process.on('exit',function(code){
    client.close(); // 释放zookeeper连接
});
process.on('uncaughtException',function(){
    process.exit(1000);
});
process.on('SIGINT',function () {
    process.exit(1001);
});
process.on('SIGTERM',function () {
    process.exit(1002);
});