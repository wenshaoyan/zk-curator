const { CuratorFrameworkFactory } = require('../index');
// promise形式连接
const connectAsync = async function () {
    let client;
    client = await CuratorFrameworkFactory.builder()
    .connectString(process.env.ZK_URL)
    .namespace('http')
    .setOptions({
        sessionTimeout: 1000
    })
    .build()
    .start();

    console.log("connectAsync连接成功");
    client.close();
};
// callback形式连接
const connectCallback = function () {
    let client;
    client = CuratorFrameworkFactory.builder()
    .connectString(process.env.ZK_URL)
    .namespace('http')
    .setOptions({
        sessionTimeout: 1000
    })
    .build(function () {
        console.log('connectCallback连接成功');
        client.close();

    });

    // 打开连接
    client.start();
};
connectAsync();
connectCallback();
