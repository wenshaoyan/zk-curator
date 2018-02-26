/**
 * Created by wenshao on 2018/2/25.
 */
'use strict';
const { CuratorFrameworkFactory } = require('../index');
const NodeCache = require('../cache/node-cache');
const PathCache = require('../cache/path-cache');
const TreeCache = require('../cache/tree-cache');
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
            nodeCreate: function () {
                console.log('nodeCreate')
                console.log(nodeCache.state)
                console.log(nodeCache.data)
            },
            nodeRemove: function () {
                console.log('nodeRemove');
                console.log(nodeCache.state)
                console.log(nodeCache.data)

            },
            nodeDataChange: function () {
                console.log('nodeDataChange')
                console.log(nodeCache.state)
                console.log(nodeCache.data)
            }
        });
        nodeCache.start();*/

        /*const pathCache = new PathCache(client,'/test');
        pathCache.addListener({
            childAdd: function () {
                console.log('childAdd');
                console.log(pathCache.state);
                console.log(pathCache.data)
                console.log(pathCache.children)
            },
            childRemove: function () {
                console.log('childRemove');
                console.log(pathCache.state);
                console.log(pathCache.data)
                console.log(pathCache.children)

            },
            nodeCreate: function () {
                console.log('nodeCreate')
                console.log(pathCache.state)
                console.log(pathCache.data)
            },
            nodeRemove: function () {
                console.log('nodeRemove');
                console.log(pathCache.state)
                console.log(pathCache.data)

            },
            nodeDataChange: function () {
                console.log('nodeDataChange');
                console.log(pathCache.state);
                console.log(pathCache.data);
            }
        });
        pathCache.start();*/
        const treeCache = new TreeCache(client,'/test');
        treeCache.addListener({
            childAdd: function () {
                console.log('childAdd');
                console.log(treeCache.data)
            },
            childRemove: function () {
                console.log('childRemove');
                console.log(treeCache.data)

            },
            nodeCreate: function () {
                console.log('nodeCreate')
                // console.log(treeCache.data)
            },
            nodeRemove: function () {
                console.log('nodeRemove');
                // console.log(treeCache.data)

            },
            nodeDataChange: function () {
                console.log('nodeDataChange');
                console.log(treeCache.data)
            }
        });
        treeCache.start();

    // console.log(result)
    }catch (e){
        console.log(e)
    }
}