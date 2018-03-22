/**
 * Created by wenshao on 2018/2/25.
 */
'use strict';
const {CuratorFrameworkFactory, NodeCache, PathCache, TreeCache} = require('../index');
let client;
client = CuratorFrameworkFactory.builder()
.connectString(process.env.ZK_URL)
.setOptions({
    sessionTimeout: 1000
})
.build(main);   // 连接成功后的回调函数

// 打开连接
client.start();

async function main() {
    // console.log('连接成功');
    try {
        /*const nodeCache = new NodeCache(client, '/test/4');
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
        nodeCache.start();*/

        /*const pathCache = new PathCache(client,'/test');
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
        await pathCache.start();*/
        const treeCache = new TreeCache(client, '/test', 2);
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
        await treeCache.start();
        treeCache.setTag('/test/4', 1);
        //console.log(treeCache.getData())
    } catch (e) {
        console.log(e)
    }
}