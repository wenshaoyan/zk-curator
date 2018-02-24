/**
 * Created by yanshaowen on 2017/9/11
 */
'use strict';
exports.CuratorFrameworkFactory = require('./framework/curator-framework-factory');
exports.Stat = require('./lib/stat');
exports.NodeCache = require('./cache/node-cache');
const JsonLength = (o) => {
    let size = 0;
    for (const key in o) {
        size++;
    }
    return size;
};

class NodesInfo {
    constructor(_client) {
        this.client = _client;
    }

    /**
     *
     * @param nodes 当前子节点的父节点对象
     * @param key   当前子节点的id
     */
    async getData(nodes, key) {
        const node = nodes[key];
        let isNext = !!await this.client.checkExists()
        .unwantedNamespace()
        .forPath(node.path);
        if (!isNext) return false;
        // 如果监听的节点注册后立刻有退出 这里会有异常:UnhandledPromiseRejectionWarning: NO_NODE: Exception: NO_NODE[-101]
        let nodeData = await this.client.getData()
        .unwantedNamespace()
        .setWatcher(this.client, (__client, event) => {
            if (event.getType() === 2) {     // 节点删除
                delete nodes[key];
            } else if (event.getType() === 3) { // 节点数据变化
                this.getData(nodes, key);
            }
        })
        .forPath(node.path);
        // nodeData = nodeConfig(nodeData);
        node.data = nodeData;
        await this.getParentData(node, node.path);

    };

    /**
     * 获取指定父节点的路径 获取子节点的id和data 并监听父节点的变化和子节点数据的变化
     * @param parent        父节点对象
     * @param parentPath    父节点路径
     */
    async getParentData(parent, parentPath) {
        let isNext = !!await this.client.checkExists()
        .unwantedNamespace()
        .forPath(parentPath);
        if (!isNext) return false;

        const childrenData = await this.client.getChildren()
        .unwantedNamespace()
        .setWatcher(this.client, (__client, event) => {
            if (event.getType() === 4) {     // 子节点变化
                this.getParentData(parent, parentPath)
            }
        })
        .forPath(parentPath);
        /*if (JsonLength(parent.nodes) > childrenData.length) {    // 子节点减少
            console.log('子节点减少');
        } else if (JsonLength(parent.nodes) < childrenData.length) { // 子节点增加
            console.log('子节点增加');
        }*/
        parent.nodes = {};
        if (childrenData.length !== 0) {
            for (const value of childrenData) {
                const child = parentPath + '/' + value;
                parent.nodes[value] = {
                    path: child,
                    id: value,
                    data: ''
                };
                await this.getData(parent.nodes, value);
            }
        }

    };
}

/**
 * 获取节点的信息和子节点信息
 * @param o
 * @param o.path
 * @param o.client
 */
exports.getNodesInfo = async function (o) {
    const nodeInfo = new NodesInfo(o.client);
    const info = {
        root: {path:o.path}
    };
    await nodeInfo.getData(info,'root');
    return info.root;
};
