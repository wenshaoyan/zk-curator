/**
 * Created by yanshaowen on 2017/9/11
 */
'use strict';
exports.CuratorFrameworkFactory = require('./framework/curator-framework-factory');
exports.Stat = require('./lib/stat');
exports.NodeCache = require('./cache/node-cache');
const NodesInfo = require('./lib/NodesInfo');
/**
 * 获取节点的信息和子节点信息
 * @param o
 * @param o.path    父节点path
 * @param o.client  zk client
 * @param o.callback  数据变化回调
 */
exports.getNodesInfo = async function (o) {
    const nodeInfo = new NodesInfo(o.client);
    const info = {
        root: {path: o.path}
    };
    await nodeInfo.getData(info, 'root',
        typeof o.callback === 'function' ? o.callback : function () {
        });
    return info.root;
};
