/**
 * Created by wenshao on 2018/2/25.
 */
'use strict';
const { CuratorFrameworkFactory, NodeCache, PathCache, TreeCache} = require('../index');
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
    try{
        /*const nodeCache = new NodeCache(client,'/test/create');
        nodeCache.addListener({
            nodeCreate: function (cache, deep) {
                console.log('nodeCreate',deep)
                console.log(cache.data)
            },
            nodeRemove: function (cache, deep) {
                console.log('nodeRemove',deep);
                console.log(cache.data)

            },
            nodeDataChange: function (cache, deep) {
                console.log('nodeDataChange',deep)
                console.log(cache.data)
            }
        });
        nodeCache.start();*/

        /*const pathCache = new PathCache(client,'/test');
        pathCache.addListener({
            childAdd: function (cache, deep) {
                console.log('childAdd');
                console.log(cache.data)
            },
            childRemove: function (cache, deep) {
                console.log('childRemove');
                console.log(cache.data)

            },
            nodeCreate: function (cache, deep) {
                console.log('nodeCreate')
                console.log(cache.data)
            },
            nodeRemove: function (cache, deep) {
                console.log('nodeRemove');
                console.log(cache.data)

            },
            nodeDataChange: function (cache, deep) {
                console.log('nodeDataChange');
                console.log(cache.data);
            }
        });
        pathCache.start();*/
        const treeCache = new TreeCache(client,'/test', 2);
        treeCache.addListener({
            childAdd: function (cache, deep) {
                console.log('childAdd',deep);
                console.log(JSON.stringify(treeCache.data))
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

    // console.log(result)
    }catch (e){
        console.log(e)
    }
}