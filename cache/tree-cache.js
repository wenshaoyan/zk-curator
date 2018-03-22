/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，及子节点的创建、更新、删除， 从数并将结点的数据缓存在本地。
 */
'use strict';
const BaseCache = require('./base-cache');
const TaskListener = require('./task-listener');

class TreeCache extends BaseCache {
    // deep: 树的最大层级 默认不限制
    constructor(client, path, maxDeep) {
        super(client, path);
        this.taskListener = new TaskListener();
        if (typeof maxDeep === 'number' && maxDeep > -1) {
            this._maxDeep = parseInt(maxDeep);
        } else {
            this._maxDeep = -1;
        }
    }

    get maxDeep() {
        return this._maxDeep;
    }

    set maxDeep(value) {
        this._maxDeep = value;
    }

    /**
     * 开始cache
     */
    async start() {
        await this.listener('init', this.data, 'root', this.path);
    }

    relativeDeep(inputPath) {
        const referenceDeep = this.path.split('/').length;
        const comparisonDeep = inputPath.split('/').length;
        return comparisonDeep - referenceDeep;
    }

    /**
     *
     * @param nodeType      节点的状态   init:启动或者节点创建时候的状态
     *                                  node:该节点删除或数据变化时候的状态
     *                                  child:子节点变化
     * @param parentData    父节点数据对象
     * @param nodeKey       当前子节点key
     * @param nodePath       当前节点的路径
     */
    async listener(nodeType, parentData, nodeKey, nodePath) {
        if (this.maxDeep !== -1 && this.relativeDeep(nodePath) > this.maxDeep) {
            return;
        }

        if (!(nodeKey in parentData)) {
            const split = nodePath.split('/');
            const id = split[split.length - 1];
            parentData[nodeKey] = {
                id: id,
                path: nodePath
            };
        }
        const current = parentData[nodeKey];
        if (nodeType === 'init' || nodeType === 'node') {
            current.state = await this.client.checkExists()
            .unwantedNamespace()
            .setCleanWatchers()
            .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
                const parentPath = nodePath.substr(0, nodePath.lastIndexOf('/'));
                if (event.getType() === 1) {    // 创建
                    this.taskListener.addNodeWatch(parentPath);
                    await this.listener('init', parentData, nodeKey, nodePath);
                    await this.taskListener.removeNodeWatch(parentPath);
                    const changeNode = BaseCache.deepCopyNode(parentData[nodeKey]);
                    this.callbacks.nodeCreate(this, this.relativeDeep(nodePath), changeNode);
                } else if (event.getType() === 2) { // 删除
                    this.taskListener.addNodeWatch(parentPath);
                    const changeNode = BaseCache.deepCopyNode(parentData[nodeKey]);
                    await this.listener('node', parentData, nodeKey, nodePath);
                    await this.taskListener.removeNodeWatch(parentPath);
                    delete parentData[nodeKey];
                    this.callbacks.nodeRemove(this, this.relativeDeep(nodePath), changeNode);
                } else if (event.getType() === 3) { // 数据变化
                    const changeNode = BaseCache.deepCopyNode(parentData[nodeKey]);
                    await this.listener('node', parentData, nodeKey, nodePath);
                    this.callbacks.nodeDataChange(this, this.relativeDeep(nodePath), changeNode);
                }
            })
            .forPath(nodePath);
        }
        if (current.state) {
            if (nodeType === 'init' || nodeType === 'node') {
                current.data = await this.client.getData()
                .unwantedNamespace()
                .forPath(nodePath);
            }
            if (nodeType === 'init' || nodeType === 'child') {
                const children = await this.client.getChildren()
                .unwantedNamespace()
                .setCleanWatchers()
                .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
                    if (event.getType() === 4) {
                        // 老的子节点列表
                        const oldChild = BaseCache.deepCopyChild(parentData[nodeKey].childrenData);
                        let oldLen = current.children.length;
                        let newLen;
                        this.taskListener.addChildWatch(nodePath);
                        await this.listener('child', parentData, nodeKey, nodePath);
                        await this.taskListener.removeChildWatch(nodePath);
                        // 新的子节点列表
                        const newChild = BaseCache.deepCopyChild(parentData[nodeKey].childrenData);
                        // 找出变化的子节点
                        const diffList = BaseCache.findDiffNode(oldChild, newChild);
                        let changeNode = {};
                        if (diffList.length === 1){
                            changeNode = diffList[0];
                        }
                        newLen = current.children.length;
                        if (newLen > oldLen) this.callbacks.childAdd(this, this.relativeDeep(nodePath), changeNode);
                        else this.callbacks.childRemove(this, this.relativeDeep(nodePath), changeNode)
                    }

                })
                .forPath(nodePath);

                current.childrenData = {};
                current.children = children;
                for (const node of children) {
                    current.childrenData[node] = {
                        id: node,
                        path: nodePath + '/' + node
                    };
                    await this.listener('init', current.childrenData, node, nodePath + '/' + node);
                }

            }
        }
    }
}

module.exports = TreeCache;