/**
 * Created by wenshao on 2018/2/24.
 */
'use strict';
/**
 * Created by yanshaowen on 2017/9/11
 */
'use strict';
class NodesInfo {
    constructor(_client) {
        this.client = _client;
    }

    /**
     *
     * @param nodes 当前子节点的父节点对象
     * @param key   当前子节点的id
     * @param callback   数据变化回调
     * @param isListener    是否为监听触发
     */
    async getData(nodes, key, callback, isListener) {
        const node = nodes[key];
        let isNext = !!await this.client.checkExists()
            .unwantedNamespace()
            .forPath(node.path);
        if (!isNext) return false;
        // 如果监听的节点注册后立刻有退出 这里会有异常:UnhandledPromiseRejectionWarning: NO_NODE: Exception: NO_NODE[-101]
        node.data = await this.client.getData()
            .unwantedNamespace()
            .setWatcher(this.client, (__client, event) => {
                if (event.getType() === 2) {     // 节点删除
                    delete nodes[key];
                    callback();
                } else if (event.getType() === 3) { // 节点数据变化
                    callback();
                    this.getData(nodes, key, callback, true);
                }
            })
            .forPath(node.path);
        await this.getParentData(node, node.path, callback);
        if (isListener) callback();
    };

    /**
     * 获取指定父节点的路径 获取子节点的id和data 并监听父节点的变化和子节点数据的变化
     * @param parent        父节点对象
     * @param parentPath    父节点路径
     * @param callback   数据变化回调
     * @param isListener    是否为监听触发
     */
    async getParentData(parent, parentPath, callback, isListener) {
        let isNext = !!await this.client.checkExists()
            .unwantedNamespace()
            .forPath(parentPath);
        if (!isNext) return false;

        const childrenData = await this.client.getChildren()
            .unwantedNamespace()
            .setWatcher(this.client, (__client, event) => {
                if (event.getType() === 4) {     // 子节点变化
                    this.getParentData(parent, parentPath, callback, true);
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
                await this.getData(parent.nodes, value, callback);
            }
        }
        if (isListener) callback();

    };
}
module.exports = NodesInfo;

